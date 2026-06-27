/**
 * Package registry connectors — NPM & PyPI.
 * Both expose public JSON registries with no auth.
 */

import { cacheGet, cacheSet, fetchJson, resilientFetch, makeCachePrefix } from './base'
import type { PackageRegistryProfile } from '@/lib/types'

const NPM_PREFIX = makeCachePrefix('npm')
const PYPI_PREFIX = makeCachePrefix('pypi')
const CACHE_TTL = 60 * 30

/* ----------------------------- NPM ----------------------------- */

interface NpmPackage {
  name: string
  description?: string
  'dist-tags'?: { latest?: string }
  time?: { [k: string]: string }
  maintainers?: unknown[]
  versions?: Record<string, unknown>
}

interface NpmSearchResult {
  total: number
  objects: { package: { name: string; description?: string; links?: { npm: string } }; score: { final: number; detail: { quality: number; popularity: number; maintenance: number } } }[]
}

export async function searchNpm(username: string): Promise<PackageRegistryProfile[]> {
  const cacheKey = `${NPM_PREFIX}${username.toLowerCase()}`
  const cached = cacheGet<PackageRegistryProfile[]>(cacheKey)
  if (cached) return cached

  // Search for packages where the user is a maintainer/author
  // NPM search supports `maintainer:` and `author:` keywords
  const results: PackageRegistryProfile[] = []
  try {
    const data = await fetchJson<NpmSearchResult>(
      `https://registry.npmjs.org/-/v1/search?text=author:${encodeURIComponent(username)}&size=10`,
      { cacheTtl: CACHE_TTL, retries: 2 }
    )
    for (const obj of data.objects || []) {
      const pkgName = obj.package.name
      const meta = await fetchJson<NpmPackage>(
        `https://registry.npmjs.org/${encodeURIComponent(pkgName)}`,
        { cacheTtl: CACHE_TTL, retries: 1 }
      ).catch(() => null)
      results.push({
        registry: 'npm',
        name: pkgName,
        found: true,
        description: obj.package.description ?? meta?.description ?? null,
        version: meta?.['dist-tags']?.latest ?? null,
        url: obj.package.links?.npm ?? `https://www.npmjs.com/package/${pkgName}`,
        maintainers: meta?.maintainers?.length ?? 0,
        lastUpdated: meta?.time?.[meta?.['dist-tags']?.latest ?? ''] ?? meta?.time?.created ?? null,
        score: Math.round((obj.score.final ?? 0) * 100),
      })
    }
  } catch {
    /* ignore */
  }
  cacheSet(cacheKey, results, CACHE_TTL)
  return results
}

/* ----------------------------- PyPI ----------------------------- */

interface PyPIPackage {
  info: {
    name: string
    summary?: string
    version?: string
    home_page?: string
    project_url?: string
    package_url?: string
    author?: string
    maintainer?: string
  }
  releases: Record<string, unknown[]>
}

export async function searchPypi(username: string): Promise<PackageRegistryProfile[]> {
  const cacheKey = `${PYPI_PREFIX}${username.toLowerCase()}`
  const cached = cacheGet<PackageRegistryProfile[]>(cacheKey)
  if (cached) return cached

  const results: PackageRegistryProfile[] = []
  // PyPI doesn't have a great author search; use the BigQuery-ish simple search via PyPI XMLRPC alternative:
  // We'll try the 'pypi.org/simple/' listing is too heavy, so we use the trove-classifier search via Google-style.
  // Instead, use the JSON endpoint for the username itself as a package name (best effort), plus try pypi.org/search
  try {
    // Try fetch packages by author via the PyPI legacy JSON search (deprecated but works via simple)
    const searchHtml = await resilientFetch(
      `https://pypi.org/search/?q=${encodeURIComponent(username)}`,
      { cacheTtl: CACHE_TTL, retries: 1, timeoutMs: 10000 }
    )
    const html = await searchHtml.text()
    // Extract package slugs from the search HTML
    const slugs = [...html.matchAll(/\/project\/([a-zA-Z0-9_.-]+)\//g)]
      .map((m) => m[1])
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .slice(0, 8)
    for (const slug of slugs) {
      const meta = await fetchJson<PyPIPackage>(
        `https://pypi.org/pypi/${encodeURIComponent(slug)}/json`,
        { cacheTtl: CACHE_TTL, retries: 1 }
      ).catch(() => null)
      if (!meta) continue
      results.push({
        registry: 'pypi',
        name: meta.info.name,
        found: true,
        description: meta.info.summary ?? null,
        version: meta.info.version ?? null,
        url: `https://pypi.org/project/${slug}/`,
        maintainers: meta.info.maintainer ? 1 : 0,
        lastUpdated: null,
        score: 0,
      })
    }
  } catch {
    /* ignore */
  }
  cacheSet(cacheKey, results, CACHE_TTL)
  return results
}

export const npmConnector = { id: 'npm', name: 'NPM', search: searchNpm }
export const pypiConnector = { id: 'pypi', name: 'PyPI', search: searchPypi }
