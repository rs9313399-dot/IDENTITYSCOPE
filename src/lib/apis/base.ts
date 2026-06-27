/**
 * Base connector architecture for IdentityScope AI.
 * Every connector exposes search() / validate() / transform() / cache()
 * and shares retry, timeout, rate-limit and error-handling logic.
 */

export class ConnectorError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'timeout'
      | 'rate_limited'
      | 'not_found'
      | 'network'
      | 'parse'
      | 'auth'
      | 'unknown',
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'ConnectorError'
  }
}

export interface FetchOptions {
  timeoutMs?: number
  retries?: number
  headers?: Record<string, string>
  cacheTtl?: number // seconds
}

interface CacheEntry {
  ts: number
  ttl: number
  data: unknown
}

const memoryCache = new Map<string, CacheEntry>()

export function cacheGet<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > entry.ttl * 1000) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheSet(key: string, data: unknown, ttlSeconds: number) {
  memoryCache.set(key, {
    ts: Date.now(),
    ttl: ttlSeconds,
    data: Object.freeze(structuredCloneSafe(data)),
  })
}

function structuredCloneSafe(data: unknown): unknown {
  try {
    if (typeof structuredClone === 'function') return structuredClone(data)
  } catch {
    /* fall through */
  }
  try {
    return JSON.parse(JSON.stringify(data))
  } catch {
    return data
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Resilient fetch with timeout, exponential backoff retry and rate-limit handling.
 */
export async function resilientFetch(
  url: string,
  opts: FetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 12000,
    retries = 3,
    headers = {},
    cacheTtl = 0,
  } = opts

  const cacheKey = cacheTtl > 0 ? `fetch:${url}` : ''
  if (cacheKey) {
    const cached = cacheGet<{ status: number; __body: string }>(cacheKey)
    if (cached) {
      return {
        ok: cached.status >= 200 && cached.status < 300,
        status: cached.status,
        json: async () => JSON.parse(cached.__body ?? '{}'),
        text: async () => cached.__body ?? '',
        clone: function () {
          return this
        },
      } as unknown as Response
    }
  }

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'IdentityScopeAI/1.0 (+https://github.com)',
          ...headers,
        },
        signal: controller.signal,
        redirect: 'follow',
      })

      clearTimeout(timer)

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after') ?? 2)
        if (attempt < retries) {
          await sleep(Math.min(retryAfter * 1000, 8000))
          continue
        }
        throw new ConnectorError('Rate limited by upstream API', 'rate_limited', 429)
      }

      if (res.status === 404) {
        throw new ConnectorError('Resource not found', 'not_found', 404)
      }

      if (res.status === 401 || res.status === 403) {
        throw new ConnectorError('Authentication required', 'auth', res.status)
      }

      if (!res.ok && res.status >= 500) {
        throw new ConnectorError(`Upstream error ${res.status}`, 'network', res.status)
      }

      if (cacheKey && res.ok) {
        try {
          const body = await res.clone().text()
          cacheSet(cacheKey, { status: res.status, __body: body }, cacheTtl)
        } catch {
          /* caching is best-effort */
        }
      }

      return res
    } catch (err) {
      clearTimeout(timer)
      lastErr = err
      if (err instanceof ConnectorError && err.code === 'not_found') throw err
      if (err instanceof ConnectorError && err.code === 'rate_limited') {
        if (attempt >= retries) throw err
        await sleep(2 ** attempt * 500)
        continue
      }
      const isAbort =
        err instanceof Error &&
        (err.name === 'AbortError' || err.name === 'TimeoutError')
      if (isAbort) {
        lastErr = new ConnectorError('Request timed out', 'timeout')
      } else if (err instanceof ConnectorError) {
        lastErr = err
      } else {
        lastErr = new ConnectorError(
          err instanceof Error ? err.message : 'Network error',
          'network'
        )
      }
      if (attempt < retries) {
        await sleep(2 ** attempt * 400 + Math.random() * 200)
        continue
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new ConnectorError('Unknown error', 'unknown')
}

export async function fetchJson<T>(
  url: string,
  opts: FetchOptions = {}
): Promise<T> {
  const res = await resilientFetch(url, opts)
  if (res.status === 204) return {} as T
  try {
    return (await res.json()) as T
  } catch {
    try {
      const text = await res.text()
      return JSON.parse(text) as T
    } catch {
      throw new ConnectorError('Failed to parse JSON response', 'parse')
    }
  }
}

export interface BaseConnector<TInput, TOutput> {
  id: string
  name: string
  validate(input: TInput): boolean
  search(input: TInput): Promise<TOutput>
  transform(raw: unknown, input: TInput): TOutput
  cache(key: string, data: TOutput, ttlSeconds?: number): void
  readCache(key: string): TOutput | null
}

export function makeCachePrefix(connectorId: string) {
  return `connector:${connectorId}:`
}
