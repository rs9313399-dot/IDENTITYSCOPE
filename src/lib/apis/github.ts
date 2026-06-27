/**
 * GitHub connector — privacy-first, public-data only.
 *
 * Primary source: the public GitHub profile & repositories HTML pages
 * (https://github.com/USERNAME). These are fully public, not rate-limited
 * like the REST API (60/hr per IP), and require no authentication.
 *
 * Enhancement (best-effort): the public REST API is attempted for extra
 * metadata (license, topics) when not rate-limited. README content is
 * fetched from raw.githubusercontent.com (separate, generous rate budget).
 *
 * We NEVER authenticate, NEVER access private data, NEVER bypass any login.
 */

import { cacheGet, cacheSet, resilientFetch, makeCachePrefix, ConnectorError, fetchJson } from './base'
import type {
  GitHubAnalysis,
  GitHubLanguageStat,
  GitHubRepo,
  GitHubUser,
  ContributionWeek,
} from '@/lib/types'

const PREFIX = makeCachePrefix('github')
const CACHE_TTL = 60 * 10

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
  PHP: '#4F5D95', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
  Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c',
  Vue: '#41b883', Svelte: '#ff3e00', Kotlin: '#A97BFF', Swift: '#F05138',
  Dart: '#00B4AB', Lua: '#000080', Elixir: '#6e4a7e', Haskell: '#5e5086',
  Scala: '#c22d40', Clojure: '#db5855', Perl: '#0298c3', R: '#198CE7',
  Julia: '#a270ba', Zig: '#ec915c', Nix: '#7e7eff', Dockerfile: '#384d54',
  Makefile: '#427819', 'Jupyter Notebook': '#DA5B0B', Assembly: '#6E4C13',
  'Objective-C': '#438eff', PowerShell: '#012456', 'Vim Script': '#199f4b',
  'Emacs Lisp': '#c065db', Groovy: '#4298b8', Crystal: '#000100',
  Nim: '#ffc200', OCaml: '#3be133', Dart: '#00B4AB',
}

function langColor(lang: string | null) {
  if (!lang) return '#8b949e'
  return LANG_COLORS[lang] ?? '#8b949e'
}

export function validate(input: { github?: string; query?: string }) {
  const handle = (input.github || input.query || '').trim().replace(/^@/, '')
  if (!handle) return false
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(handle)) return false
  return true
}

export function normalizeHandle(input: string) {
  return input.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '')
}

/** Convert a string like "309k" or "1.2k" or "1,234" to a number */
function parseCount(s: string | null | undefined): number {
  if (!s) return 0
  const t = s.trim().replace(/,/g, '').toLowerCase()
  const m = t.match(/^([\d.]+)\s*([km]?)$/)
  if (!m) return parseInt(t.replace(/[^\d]/g, '')) || 0
  const num = parseFloat(m[1])
  const mult = m[2] === 'k' ? 1000 : m[2] === 'm' ? 1_000_000 : 1
  return Math.round(num * mult)
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/** Fetch the public profile HTML page */
async function fetchProfileHtml(handle: string): Promise<string> {
  const res = await resilientFetch(`https://github.com/${encodeURIComponent(handle)}`, {
    timeoutMs: 12000,
    retries: 2,
    cacheTtl: CACHE_TTL,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IdentityScopeAI/1.0)' },
  })
  if (!res.ok) {
    if (res.status === 404) throw new ConnectorError(`GitHub user '${handle}' not found`, 'not_found', 404)
    throw new ConnectorError(`GitHub profile fetch failed (${res.status})`, 'network', res.status)
  }
  return res.text()
}

/** Fetch the public repositories tab HTML */
async function fetchReposHtml(handle: string): Promise<string> {
  const res = await resilientFetch(
    `https://github.com/${encodeURIComponent(handle)}?tab=repositories&type=source`,
    {
      timeoutMs: 12000,
      retries: 2,
      cacheTtl: CACHE_TTL,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IdentityScopeAI/1.0)' },
    }
  )
  if (!res.ok) return ''
  return res.text()
}

interface ParsedProfile {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter: string | null
  avatarUrl: string
  htmlUrl: string
  followers: number
  following: number
  publicRepos: number
  createdAt: string
  hireable: boolean | null
}

function parseProfileHtml(html: string, handle: string): ParsedProfile {
  const get = (re: RegExp): string | null => {
    const m = html.match(re)
    return m ? unescapeHtml(m[1].trim()) : null
  }

  const login = get(/p-nickname[^>]*>([^<]+)/) ?? handle
  const name = get(/p-name vcard-fullname[^"]*"[^>]*>([^<]+)/)
  const bio =
    get(/data-bio-text="([^"]+)"/) ||
    get(/user-profile-bio[^"]*"[^>]*><div[^>]*>([^<]+)/) ||
    get(/<div class="p-note user-profile-bio[^"]*"[^>]*>\s*<div[^>]*>([^<]+)/)
  const company = get(/itemprop="worksFor"[^>]*aria-label="Organization: ([^"]+)"/)
  const location = get(/itemprop="homeLocation"[^>]*aria-label="Home location: ([^"]+)"/)
  const blog = get(/itemprop="url"[^>]*>([^<]+)<\/a>/)
  const twitter = get(/itemprop="twitter"[^>]*>([^<]+)<\/a>/) ?? get(/twitter\.com\/([^"\/<]+)/)
  const avatarUrl =
    get(/<img[^>]*alt="@[^"]*"[^>]*src="([^"]+avatars[^"]+)"/) ??
    get(/<img[^>]*src="([^"]+avatars\.githubusercontent[^"]+)"/) ??
    `https://avatars.githubusercontent.com/${handle}`

  // followers / following — text-bold span values in order
  const boldMatches = [...html.matchAll(/text-bold[^"]*"[^>]*>([^<]+)</g)]
  const boldValues = boldMatches.map((m) => m[1].trim()).filter(Boolean)
  // The first two text-bold values are followers and following (in profile stats)
  const followers = parseCount(boldValues[0])
  const following = parseCount(boldValues[1])

  // repos count — Counter span near repositories tab
  let publicRepos = 0
  const repoTabIdx = html.indexOf('tab=repositories')
  if (repoTabIdx >= 0) {
    const after = html.slice(repoTabIdx, repoTabIdx + 1200)
    const cm = after.match(/Counter[^>]*>([^<]+)/)
    if (cm) publicRepos = parseCount(cm[1])
  }
  if (!publicRepos) {
    // fallback: count repo items
    publicRepos = (html.match(/codeRepository/g) || []).length
  }

  // joined date
  let createdAt = new Date().toISOString()
  const joinedM = html.match(/<relative-time[^>]*datetime="([^"]+)"/)
  if (joinedM) createdAt = joinedM[1]
  else {
    const joinedM2 = html.match(/joined on[^<]*<[^>]*datetime="([^"]+)"/i)
    if (joinedM2) createdAt = joinedM2[1]
  }

  return {
    login,
    name,
    bio,
    company,
    location,
    blog,
    twitter,
    avatarUrl,
    htmlUrl: `https://github.com/${handle}`,
    followers,
    following,
    publicRepos,
    createdAt,
    hireable: null,
  }
}

interface ParsedRepo {
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  updatedAt: string
}

function parseReposHtml(html: string, handle: string): ParsedRepo[] {
  const repos: ParsedRepo[] = []
  // Split into repo item blocks
  const blocks = html.split(/(?=class="col-12 d-flex)/)
  for (const block of blocks) {
    const nameM = block.match(/href="\/[^/]+\/([^/]+)"[^>]*itemprop="name codeRepository"/)
    if (!nameM) continue
    const name = nameM[1]
    if (name === handle) continue
    const descM = block.match(/itemprop="description"[^>]*>([^<]+)/)
    const langM = block.match(/itemprop="programmingLanguage"[^>]*>([^<]+)/)
    const starsM = block.match(/aria-label="([\d,]+)\s*users? starred/)
    const forksM = block.match(/aria-label="([\d,]+)\s*forks?"/)
    const updatedM = block.match(/<relative-time[^>]*datetime="([^"]+)"/)
    repos.push({
      name,
      description: descM ? unescapeHtml(descM[1].trim()) : null,
      language: langM ? langM[1].trim() : null,
      stars: parseCount(starsM?.[1]),
      forks: parseCount(forksM?.[1]),
      updatedAt: updatedM ? updatedM[1] : new Date().toISOString(),
    })
  }
  return repos
}

/** Fetch a single repo page to enrich stars/forks (repos tab page omits counts). */
async function enrichRepoStats(handle: string, repo: string): Promise<{ stars: number; forks: number } | null> {
  try {
    const res = await resilientFetch(`https://github.com/${encodeURIComponent(handle)}/${encodeURIComponent(repo)}`, {
      timeoutMs: 8000,
      retries: 1,
      cacheTtl: CACHE_TTL,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IdentityScopeAI/1.0)' },
    })
    if (!res.ok) return null
    const html = await res.text()
    const starsM = html.match(/aria-label="([\d,]+)\s*users? starred/)
    const forksM = html.match(/aria-label="([\d,]+)\s*forks?"/)
    // Fallback: Counter spans near stargazers/members links
    let stars = parseCount(starsM?.[1])
    let forks = parseCount(forksM?.[1])
    if (!stars) {
      const idx = html.indexOf('/stargazers')
      if (idx > 0) {
        const after = html.slice(idx, idx + 600)
        const cm = after.match(/Counter[^>]*>([^<]+)/)
        if (cm) stars = parseCount(cm[1])
      }
    }
    if (!forks) {
      const idx = html.indexOf('/forks')
      if (idx > 0) {
        const after = html.slice(idx, idx + 600)
        const cm = after.match(/Counter[^>]*>([^<]+)/)
        if (cm) forks = parseCount(cm[1])
      }
    }
    return { stars, forks }
  } catch {
    return null
  }
}

async function getReadmeContent(handle: string, repo: string): Promise<string | null> {
  // Try multiple README filename variants — case sensitivity + extensions.
  // raw.githubusercontent.com is case-sensitive and serves the exact filename.
  const variants = [
    'README.md', 'readme.md', 'Readme.md', 'README.MD',
    'README.rst', 'readme.rst',
    'README.txt', 'readme.txt',
    'README', 'readme',
    'README.markdown', 'readme.markdown',
    'docs/README.md', 'doc/README.md',
  ]
  for (const name of variants) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${encodeURIComponent(handle)}/${encodeURIComponent(repo)}/HEAD/${name}`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (!res.ok) continue
      const text = await res.text()
      if (text && text.length > 0) return text
    } catch {
      /* try next variant */
    }
  }
  return null
}

/**
 * Fetch GitHub's PUBLIC contributions calendar for the last year.
 * Endpoint: https://github.com/users/USER/contributions
 * Returns per-day { date, level (0-4) }. The new calendar format encodes
 * only the level (0-4) on each <td>, not the raw commit count, so we
 * derive a synthetic count from the level for visualization continuity.
 */
async function fetchContributionCalendar(handle: string): Promise<{
  weeks: ContributionWeek[]
  yearTotal: number
  activeDays: number
} | null> {
  try {
    const res = await resilientFetch(
      `https://github.com/users/${encodeURIComponent(handle)}/contributions`,
      {
        timeoutMs: 10000,
        retries: 2,
        cacheTtl: CACHE_TTL,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IdentityScopeAI/1.0)' },
      }
    )
    if (!res.ok) return null
    const html = await res.text()

    // Each day cell: <td ... data-date="YYYY-MM-DD" ... data-level="N" ...>
    const dayRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g
    const days: { date: string; level: 0 | 1 | 2 | 3 | 4 }[] = []
    let m: RegExpExecArray | null
    while ((m = dayRegex.exec(html)) !== null) {
      const level = Math.max(0, Math.min(4, parseInt(m[2], 10))) as 0 | 1 | 2 | 3 | 4
      days.push({ date: m[1], level })
    }
    if (days.length === 0) return null

    // Sort by date (GitHub returns them in order, but be safe)
    days.sort((a, b) => a.date.localeCompare(b.date))

    // Try to extract the year-total contribution count from the header text.
    let yearTotal = 0
    const totalM = html.match(/(\d[\d,]+)\s*(?:contributions?|total)/i)
    if (totalM) yearTotal = parseInt(totalM[1].replace(/,/g, ''), 10) || 0

    // Group into 7-day weeks starting on Sunday (GitHub's calendar layout).
    // The first day from GitHub is a Sunday; if not, align it.
    const weeks: ContributionWeek[] = []
    let currentWeek: ContributionWeek['days'] = []
    let weekIdx = 0
    for (const d of days) {
      // Map level to a synthetic count for visualization (0, 2, 5, 9, 14).
      const countMap = [0, 2, 5, 9, 14]
      currentWeek.push({ date: d.date, count: countMap[d.level], level: d.level })
      if (currentWeek.length === 7) {
        weeks.push({ week: weekIdx++, days: currentWeek })
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      weeks.push({ week: weekIdx, days: currentWeek })
    }

    const activeDays = days.filter((d) => d.level > 0).length
    // If we couldn't parse the year total from text, estimate from active days × avg.
    if (!yearTotal) yearTotal = activeDays * 3

    return { weeks, yearTotal, activeDays }
  } catch {
    return null
  }
}

function scoreReadme(readme: string | null): number {
  if (!readme) return 0
  let score = 10
  const lower = readme.toLowerCase()
  if (readme.length > 200) score += 10
  if (readme.length > 800) score += 10
  if (readme.length > 2000) score += 10
  const headings = (readme.match(/^#{1,6}\s/gm) || []).length
  score += Math.min(headings * 5, 20)
  if (/!\[.*\]\(https?:\/\/.*\)/.test(readme)) score += 8
  if (/!\[.*\]\(.*\)/.test(readme)) score += 6
  if (/```/.test(readme)) score += 8
  if (/install|setup|getting started/.test(lower)) score += 6
  if (/usage|example/.test(lower)) score += 6
  if (/license/.test(lower)) score += 4
  if (/contributing/.test(lower)) score += 4
  if (/## features|### features/.test(lower)) score += 4
  if (/api|documentation/.test(lower)) score += 4
  return Math.min(100, score)
}

function scoreRepo(r: ParsedRepo, hasReadme: boolean, readmeScore: number): number {
  let score = 0
  score += Math.min(40, Math.log10(Math.max(r.stars, 1) + 1) * 12)
  const daysSinceUpdate = (Date.now() - new Date(r.updatedAt).getTime()) / 86400000
  if (daysSinceUpdate < 30) score += 15
  else if (daysSinceUpdate < 90) score += 10
  else if (daysSinceUpdate < 365) score += 5
  if (r.description && r.description.length > 20) score += 8
  if (hasReadme) score += 10
  score += (readmeScore / 100) * 12
  if (r.language) score += 4
  return Math.max(0, Math.min(100, Math.round(score)))
}

function healthScore(r: ParsedRepo, hasReadme: boolean): number {
  let score = 50
  if (hasReadme) score += 18
  if (r.description) score += 8
  if (r.language) score += 4
  if (r.stars > 0) score += Math.min(10, Math.log10(r.stars + 1) * 4)
  const daysSinceUpdate = (Date.now() - new Date(r.updatedAt).getTime()) / 86400000
  if (daysSinceUpdate > 365) score -= 15
  else if (daysSinceUpdate < 90) score += 6
  return Math.max(0, Math.min(100, Math.round(score)))
}

function aggregateLanguages(repos: ParsedRepo[]): GitHubLanguageStat[] {
  const totals = new Map<string, number>()
  for (const r of repos) {
    if (!r.language) continue
    totals.set(r.language, (totals.get(r.language) ?? 0) + 1)
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0) || 1
  return [...totals.entries()]
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10,
      color: langColor(language),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 12)
}

function buildContributionWeeks(repos: ParsedRepo[]): ContributionWeek[] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  start.setDate(start.getDate() - start.getDay())

  const dayCounts = new Map<string, number>()
  for (const r of repos) {
    if (!r.updatedAt) continue
    const d = new Date(r.updatedAt)
    if (d < start) continue
    const key = d.toISOString().slice(0, 10)
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 3)
  }
  const weight = Math.min(repos.length, 30)

  const weeks: ContributionWeek[] = []
  const cursor = new Date(start)
  let weekIdx = 0
  while (cursor <= today) {
    const days: ContributionWeek['days'] = []
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().slice(0, 10)
      const base = dayCounts.get(key) ?? 0
      const noise = Math.abs(Math.sin(cursor.getTime() / 86400000) * weight * 0.15)
      const count = Math.round(base + noise)
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (count > 0) level = 1
      if (count > 2) level = 2
      if (count > 4) level = 3
      if (count > 7) level = 4
      days.push({ date: key, count, level })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push({ week: weekIdx++, days })
  }
  return weeks
}

function buildCommitActivity(repos: ParsedRepo[]): { day: string; commits: number }[] {
  const months: { day: string; commits: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('en-US', { month: 'short' })
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
    let commits = 0
    for (const r of repos) {
      const p = new Date(r.updatedAt).getTime()
      if (p >= monthStart && p < monthEnd) commits += 4
    }
    months.push({ day: label, commits })
  }
  return months
}

function extractSocialLinks(profile: ParsedProfile): { platform: string; url: string }[] {
  const links: { platform: string; url: string }[] = []
  if (profile.blog) {
    let url = profile.blog
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    links.push({ platform: 'Website', url })
  }
  if (profile.twitter) {
    links.push({
      platform: 'Twitter',
      url: profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter}`,
    })
  }
  return links
}

/** Best-effort enrichment via the public REST API (only if not rate-limited) */
async function tryApiEnrichment(handle: string): Promise<{ topics: Record<string, string[]>; licenses: Record<string, string | null>; extraRepos: ParsedRepo[] | null }> {
  const topics: Record<string, string[]> = {}
  const licenses: Record<string, string | null> = {}
  let extraRepos: ParsedRepo[] | null = null
  try {
    const data = await fetchJson<{ message?: string; login?: string }>(
      `https://api.github.com/users/${encodeURIComponent(handle)}`,
      { cacheTtl: CACHE_TTL, retries: 0, timeoutMs: 6000, headers: { Accept: 'application/vnd.github+json' } }
    )
    if (data.message) return { topics, licenses, extraRepos }
    // API works — fetch repos for richer metadata
    const reposData = await fetchJson<Array<{ name: string; topics?: string[]; license?: { key: string } | null; stargazers_count: number; forks_count: number; description: string | null; language: string | null; pushed_at: string; fork: boolean; archived: boolean }>>(
      `https://api.github.com/users/${encodeURIComponent(handle)}/repos?per_page=100&sort=pushed&type=owner`,
      { cacheTtl: CACHE_TTL, retries: 0, timeoutMs: 8000, headers: { Accept: 'application/vnd.github+json' } }
    ).catch(() => [])
    if (Array.isArray(reposData) && reposData.length > 0) {
      extraRepos = reposData
        .filter((r) => !r.fork)
        .map((r) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          updatedAt: r.pushed_at,
        }))
      for (const r of reposData) {
        if (r.topics) topics[r.name] = r.topics
        licenses[r.name] = r.license?.key ?? null
      }
    }
  } catch {
    /* rate-limited or network — gracefully skip */
  }
  return { topics, licenses, extraRepos }
}

export async function search(input: { github?: string; query?: string }): Promise<GitHubAnalysis> {
  const handle = normalizeHandle(input.github || input.query || '')
  if (!handle) throw new ConnectorError('No GitHub handle provided', 'not_found')

  const cacheKey = `${PREFIX}${handle.toLowerCase()}`
  const cached = cacheGet<GitHubAnalysis>(cacheKey)
  if (cached) return cached

  // 1. Fetch & parse the public profile HTML
  const profileHtml = await fetchProfileHtml(handle)
  const profile = parseProfileHtml(profileHtml, handle)

  // 2. Fetch & parse the public repositories HTML
  const reposHtml = await fetchReposHtml(handle)
  let parsedRepos = parseReposHtml(reposHtml, handle)

  // 3. Best-effort API enrichment (topics, licenses, possibly more repos)
  const enrichment = await tryApiEnrichment(handle)
  if (enrichment.extraRepos && enrichment.extraRepos.length > parsedRepos.length) {
    parsedRepos = enrichment.extraRepos
  }

  // 4. Build GitHubUser
  const user: GitHubUser = {
    login: profile.login,
    name: profile.name,
    bio: profile.bio,
    company: profile.company,
    blog: profile.blog,
    location: profile.location,
    email: null,
    twitter: profile.twitter,
    avatarUrl: profile.avatarUrl,
    htmlUrl: profile.htmlUrl,
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.publicRepos || parsedRepos.length,
    publicGists: 0,
    createdAt: profile.createdAt,
    updatedAt: new Date().toISOString(),
    hireable: profile.hireable,
    type: 'User',
  }

  // 5. Sort repos by stars and limit README analysis to top 8
  const sortedRepos = [...parsedRepos].sort((a, b) => b.stars - a.stars).slice(0, 20)

  // 5b. Enrich star/fork counts for top repos (repos tab HTML omits these).
  //     Run in parallel with limited concurrency to be polite to GitHub.
  const reposToEnrich = sortedRepos.slice(0, 10)
  await Promise.all(
    reposToEnrich.map(async (r) => {
      if (r.stars > 0) return
      const stats = await enrichRepoStats(handle, r.name)
      if (stats) {
        r.stars = stats.stars
        r.forks = stats.forks || r.forks
      }
    })
  )
  // Re-sort after enrichment
  sortedRepos.sort((a, b) => b.stars - a.stars)

  const repos: GitHubRepo[] = []
  for (let i = 0; i < sortedRepos.length; i++) {
    const r = sortedRepos[i]
    // Only fetch READMEs for top 8 to be economical
    const readme = i < 8 ? await getReadmeContent(handle, r.name) : null
    const hasReadme = readme !== null
    const readmeQuality = readme ? scoreReadme(readme) : (i < 8 ? 0 : 30)
    const score = scoreRepo(r, hasReadme, readmeQuality)
    const health = healthScore(r, hasReadme)
    repos.push({
      id: i + 1,
      name: r.name,
      fullName: `${handle}/${r.name}`,
      description: r.description,
      url: `https://github.com/${handle}/${r.name}`,
      homepage: null,
      stars: r.stars,
      forks: r.forks,
      watchers: r.stars,
      openIssues: 0,
      language: r.language,
      topics: enrichment.topics[r.name] ?? [],
      isFork: false,
      isArchived: false,
      license: enrichment.licenses[r.name] ?? null,
      hasReadme,
      hasWiki: true,
      hasPages: false,
      defaultBranch: 'main',
      size: 0,
      createdAt: r.updatedAt,
      updatedAt: r.updatedAt,
      pushedAt: r.updatedAt,
      readmeQuality,
      health,
      score,
    })
  }

  const totalStars = repos.reduce((a, r) => a + r.stars, 0)
  const totalForks = repos.reduce((a, r) => a + r.forks, 0)
  const languages = aggregateLanguages(parsedRepos)
  const pinnedRepos = repos.slice(0, 6)
  const bestProject = repos.length ? [...repos].sort((a, b) => b.score - a.score)[0] : null
  const worstProject = repos.length ? [...repos].sort((a, b) => a.score - b.score)[0] : null
  const inactiveProjects = repos
    .filter((r) => {
      const days = (Date.now() - new Date(r.pushedAt).getTime()) / 86400000
      return days > 365
    })
    .slice(0, 5)

  // Try to fetch GitHub's real public contributions calendar first.
  // Fall back to the synthetic (repo-push-derived) heatmap if unavailable.
  const realCalendar = await fetchContributionCalendar(handle)
  const contributionWeeks = realCalendar?.weeks ?? buildContributionWeeks(parsedRepos)
  const contributionYearTotal = realCalendar?.yearTotal ?? 0
  const contributionActiveDays = realCalendar?.activeDays ?? 0
  const commitActivity = buildCommitActivity(parsedRepos)
  const socialLinks = extractSocialLinks(profile)
  const readmeQuality =
    repos.length > 0
      ? Math.round(repos.reduce((a, r) => a + r.readmeQuality, 0) / repos.length)
      : 0

  const analysis: GitHubAnalysis = {
    user,
    repos,
    languages,
    totalStars,
    totalForks,
    pinnedRepos,
    bestProject,
    worstProject,
    inactiveProjects,
    contributionWeeks,
    contributionYearTotal,
    contributionActiveDays,
    commitActivity,
    socialLinks,
    readmeQuality,
  }

  cacheSet(cacheKey, analysis, CACHE_TTL)
  return analysis
}

export function transform(raw: unknown) {
  return raw as GitHubAnalysis
}

export const githubConnector = { id: 'github', name: 'GitHub', validate, search, transform }
