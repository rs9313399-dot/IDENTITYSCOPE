/**
 * Website / Portfolio analyzer.
 * Fetches the public HTML of a website and analyzes meta tags, OG, security
 * headers, responsiveness, technology fingerprints — using only the public
 * HTTP response. No auth, no scraping of private content.
 */

import { cacheGet, cacheSet, resilientFetch, makeCachePrefix } from './base'
import type { WebsiteAnalysis, SecurityHeader } from '@/lib/types'

const PREFIX = makeCachePrefix('website')
const CACHE_TTL = 60 * 10

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property|http-equiv)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*content=["']([^"']*)["']`,
    'i'
  )
  const m = html.match(re)
  if (m) return m[1]
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property|http-equiv)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
    'i'
  )
  const m2 = html.match(re2)
  return m2 ? m2[1] : null
}

function extractAllMeta(html: string): { name: string; content: string }[] {
  const out: { name: string; content: string }[] = []
  const re = /<meta\s+([^>]+)>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1]
    const nameM = attrs.match(/(?:name|property|http-equiv)=["']([^"']+)["']/i)
    const contentM = attrs.match(/content=["']([^"']*)["']/i)
    if (nameM && contentM) {
      out.push({ name: nameM[1], content: contentM[1] })
    }
  }
  return out
}

function detectTechnologies(html: string, headers: Record<string, string>): string[] {
  const techs = new Set<string>()
  const lower = html.toLowerCase()
  if (/next\.js|_next\//i.test(html)) techs.add('Next.js')
  if (/react/i.test(html) || /__NEXT_DATA__/.test(html)) techs.add('React')
  if (/vue/i.test(html)) techs.add('Vue')
  if (/svelte/i.test(html)) techs.add('Svelte')
  if (/angular/i.test(html)) techs.add('Angular')
  if (/nuxt/i.test(html)) techs.add('Nuxt')
  if (/gatsby/i.test(html)) techs.add('Gatsby')
  if (/wordpress|wp-content/i.test(html)) techs.add('WordPress')
  if (/shopify/i.test(html)) techs.add('Shopify')
  if (/squarespace/i.test(html)) techs.add('Squarespace')
  if (/wix\.com|wixstatic/i.test(html)) techs.add('Wix')
  if (/cloudflare/i.test(headers.server || '')) techs.add('Cloudflare')
  if (/nginx/i.test(headers.server || '')) techs.add('Nginx')
  if (/apache/i.test(headers.server || '')) techs.add('Apache')
  if (/vercel/i.test(headers.server || headers['x-vercel-id'] || '')) techs.add('Vercel')
  if (/tailwind/i.test(lower)) techs.add('Tailwind CSS')
  if (/bootstrap/i.test(lower)) techs.add('Bootstrap')
  if (/font-awesome|fontawesome/i.test(lower)) techs.add('Font Awesome')
  if (/google-analytics|gtag\(|google_tag/i.test(lower)) techs.add('Google Analytics')
  if (/hotjar/i.test(lower)) techs.add('Hotjar')
  if (/sentry/i.test(lower)) techs.add('Sentry')
  if (/graphql/i.test(lower)) techs.add('GraphQL')
  if (/<svg/i.test(html)) techs.add('SVG')
  return [...techs]
}

function buildSecurityHeaders(headers: Record<string, string>): SecurityHeader[] {
  const list: SecurityHeader[] = [
    {
      name: 'Strict-Transport-Security (HSTS)',
      present: !!headers['strict-transport-security'],
      value: headers['strict-transport-security'],
      severity: 'good',
    },
    {
      name: 'Content-Security-Policy',
      present: !!headers['content-security-policy'],
      value: headers['content-security-policy'],
      severity: 'good',
    },
    {
      name: 'X-Frame-Options',
      present: !!headers['x-frame-options'],
      value: headers['x-frame-options'],
      severity: 'good',
    },
    {
      name: 'X-Content-Type-Options',
      present: !!headers['x-content-type-options'],
      value: headers['x-content-type-options'],
      severity: 'good',
    },
    {
      name: 'Referrer-Policy',
      present: !!headers['referrer-policy'],
      value: headers['referrer-policy'],
      severity: 'good',
    },
    {
      name: 'Permissions-Policy',
      present: !!headers['permissions-policy'],
      value: headers['permissions-policy'],
      severity: 'good',
    },
    {
      name: 'X-Powered-By (leaks info)',
      present: !!headers['x-powered-by'],
      value: headers['x-powered-by'],
      severity: 'bad',
    },
    {
      name: 'Server (leaks info)',
      present: !!headers.server,
      value: headers.server,
      severity: 'warning',
    },
  ]
  return list
}

function scorePerformance(html: string, size: number, loadMs: number): number {
  let score = 100
  if (size > 500_000) score -= 15
  if (size > 1_500_000) score -= 20
  if (loadMs > 1000) score -= 15
  if (loadMs > 2500) score -= 20
  // inline scripts penalty
  const inlineScripts = (html.match(/<script[^>]*>(?!<\/script>)/gi) || []).length
  if (inlineScripts > 8) score -= 10
  // many external requests heuristic
  const scripts = (html.match(/<script[^>]+src=/gi) || []).length
  if (scripts > 10) score -= 10
  return Math.max(0, Math.min(100, score))
}

function scoreSeo(
  html: string,
  title: string | null,
  description: string | null,
  og: Record<string, string>
): number {
  let score = 0
  if (title && title.length > 10 && title.length < 70) score += 25
  else if (title) score += 10
  if (description && description.length > 50 && description.length < 170) score += 25
  else if (description) score += 10
  if (og.title) score += 10
  if (og.description) score += 10
  if (og.image) score += 10
  if (/<h1[^>]*>/i.test(html)) score += 10
  if (/lang=["'][a-z-]+["']/i.test(html)) score += 5
  if (/<meta[^>]+name=["']robots["']/i.test(html)) score += 5
  return Math.min(100, score)
}

function scoreAccessibility(html: string): number {
  let score = 0
  // images with alt
  const imgs = html.match(/<img[^>]+>/gi) || []
  const withAlt = imgs.filter((i) => /alt=["']/i.test(i)).length
  if (imgs.length > 0) score += Math.round((withAlt / imgs.length) * 30)
  else score += 15
  if (/<html[^>]+lang=/i.test(html)) score += 15
  if (/aria-label|aria-labelledby|role=/i.test(html)) score += 20
  if (/<nav[^>]*>/i.test(html)) score += 10
  if (/<main[^>]*>/i.test(html)) score += 10
  if (/<button[^>]*aria-label/i.test(html)) score += 5
  if (/<input[^>]+aria-label|<input[^>]+id=/i.test(html)) score += 5
  return Math.min(100, score)
}

export function validate(input: { website?: string }) {
  const url = (input.website || '').trim()
  if (!url) return false
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.includes('.')
  } catch {
    return false
  }
}

export function normalizeUrl(url: string) {
  let u = url.trim()
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`
  return u.replace(/\/$/, '')
}

export async function search(input: { website?: string }): Promise<WebsiteAnalysis> {
  const raw = (input.website || '').trim()
  if (!raw) throw new Error('No website provided')
  const url = normalizeUrl(raw)
  const cacheKey = `${PREFIX}${url.toLowerCase()}`
  const cached = cacheGet<WebsiteAnalysis>(cacheKey)
  if (cached) return cached

  const start = Date.now()
  let httpStatus = 0
  let reachable = false
  let html = ''
  let finalUrl = url
  let responseHeaders: Record<string, string> = {}

  try {
    const res = await resilientFetch(url, { timeoutMs: 15000, retries: 2, cacheTtl: 0 })
    httpStatus = res.status
    reachable = res.ok
    finalUrl = res.url || url
    res.headers.forEach((v, k) => {
      responseHeaders[k.toLowerCase()] = v
    })
    html = await res.text().catch(() => '')
  } catch {
    /* unreachable */
  }

  const loadTimeMs = Date.now() - start
  const https = finalUrl.startsWith('https://')
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null
  const description = extractMeta(html, 'description')
  const metaTags = extractAllMeta(html)
  const openGraph: Record<string, string> = {}
  for (const m of metaTags) {
    if (m.name.startsWith('og:')) openGraph[m.name] = m.content
  }
  const twitterCard: Record<string, string> = {}
  for (const m of metaTags) {
    if (m.name.startsWith('twitter:')) twitterCard[m.name] = m.content
  }
  const favicon =
    html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null

  const responsive =
    /<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']*width=device-width/i.test(html)
  const language = html.match(/<html[^>]+lang=["']([a-zA-Z-]+)["']/i)?.[1] ?? null

  const technologies = detectTechnologies(html, responseHeaders)
  const securityHeaders = buildSecurityHeaders(responseHeaders)
  const performance = scorePerformance(html, html.length, loadTimeMs)
  const seo = scoreSeo(html, title, description, openGraph)
  const accessibility = scoreAccessibility(html)
  const score = Math.round(
    performance * 0.3 + seo * 0.3 + accessibility * 0.2 + (https ? 10 : 0) + (securityHeaders.filter((h) => h.present && h.severity === 'good').length / securityHeaders.filter((h) => h.severity === 'good').length) * 10
  )

  const analysis: WebsiteAnalysis = {
    url,
    finalUrl,
    reachable,
    https,
    httpStatus,
    title,
    description,
    metaTags: metaTags.slice(0, 20),
    openGraph,
    twitterCard,
    favicon: favicon ? (favicon.startsWith('http') ? favicon : new URL(favicon, finalUrl).href) : null,
    responsive,
    performance,
    seo,
    accessibility,
    securityHeaders,
    technologies,
    language,
    pageSizeBytes: html.length,
    loadTimeMs,
    score: Math.max(0, Math.min(100, score)),
  }
  cacheSet(cacheKey, analysis, CACHE_TTL)
  return analysis
}

export const websiteConnector = { id: 'website', name: 'Website Analyzer', validate, search }
