/**
 * Main scan endpoint — orchestrates all connectors and returns a full
 * DigitalIdentityReport. Saves the result to the local DB for history.
 *
 * POST /api/scan
 * body: { query: string, github?: string, email?: string, website?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import type {
  DigitalIdentityReport,
  ConnectorResult,
  ScanInput,
} from '@/lib/types'
import * as githubApi from '@/lib/apis/github'
import * as codeforcesApi from '@/lib/apis/codeforces'
import * as packagesApi from '@/lib/apis/packages'
import * as socialApi from '@/lib/apis/social'
import * as websiteApi from '@/lib/apis/website'
import * as emailApi from '@/lib/apis/email'
import { computeScores, buildFallbackAIReport } from '@/lib/scoring'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Body = z.object({
  query: z.string().min(1).max(100),
  github: z.string().max(100).optional(),
  email: z.string().max(200).optional(),
  website: z.string().max(500).optional(),
})

// Simple per-IP rate limiting (in-memory)
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 8
const hits = new Map<string, { count: number; ts: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.ts > RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now })
    return true
  }
  entry.count++
  return entry.count <= RATE_MAX
}

function detectQueryType(query: string): ScanInput['type'] {
  const v = query.trim().toLowerCase()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email'
  if (/^https?:\/\//i.test(query) || /^[\w-]+\.[a-z]{2,}(\/|$)/i.test(query)) return 'website'
  return 'username'
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon'
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429 }
    )
  }

  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const start = Date.now()
  const queryType = detectQueryType(body.query)

  // Normalize inputs
  let githubHandle = body.github?.trim() || ''
  let email = body.email?.trim() || ''
  let website = body.website?.trim() || ''
  const username = body.query.trim()

  if (queryType === 'email' && !email) email = username
  if (queryType === 'website' && !website) website = username
  if (queryType === 'username') {
    if (!githubHandle) githubHandle = username
  }
  if (queryType === 'website' && !githubHandle) githubHandle = ''

  const input: ScanInput = { query: username, type: queryType, github: githubHandle || undefined, email: email || undefined, website: website || undefined }

  const connectors: ConnectorResult[] = []

  // Run connectors in parallel where possible
  const tasks: Promise<void>[] = []

  let githubResult: Awaited<ReturnType<typeof githubApi.search>> | null = null
  if (githubHandle && githubApi.validate({ github: githubHandle })) {
    tasks.push(
      githubApi
        .search({ github: githubHandle })
        .then((r) => {
          githubResult = r
          connectors.push({
            id: 'github',
            name: 'GitHub',
            status: 'found',
            url: r.user.htmlUrl,
            data: { followers: r.user.followers, repos: r.repos.length, stars: r.totalStars },
          })
        })
        .catch((e) => {
          connectors.push({
            id: 'github',
            name: 'GitHub',
            status: e?.code === 'not_found' ? 'not_found' : 'error',
            error: e?.message ?? 'GitHub lookup failed',
          })
        })
    )
  }

  let websiteResult: Awaited<ReturnType<typeof websiteApi.search>> | null = null
  if (website && websiteApi.validate({ website })) {
    tasks.push(
      websiteApi
        .search({ website })
        .then((r) => {
          websiteResult = r
          connectors.push({
            id: 'website',
            name: 'Website',
            status: r.reachable ? 'found' : 'not_found',
            url: r.url,
            data: { score: r.score, performance: r.performance, seo: r.seo },
          })
        })
        .catch((e) => {
          connectors.push({ id: 'website', name: 'Website', status: 'error', error: e?.message })
        })
    )
  }

  let emailResult: Awaited<ReturnType<typeof emailApi.search>> | null = null
  if (email && emailApi.validate({ email })) {
    tasks.push(
      emailApi
        .search({ email })
        .then((r) => {
          emailResult = r
          connectors.push({
            id: 'email',
            name: 'Email',
            status: 'found',
            data: { valid: r.valid, deliverability: r.deliverability },
          })
        })
        .catch((e) => {
          connectors.push({ id: 'email', name: 'Email', status: 'error', error: e?.message })
        })
    )
  }

  let codeforces: Awaited<ReturnType<typeof codeforcesApi.search>> | null = null
  if (username && codeforcesApi.validate({ query: username })) {
    tasks.push(
      codeforcesApi
        .search({ query: username })
        .then((r) => {
          codeforces = r
          connectors.push({
            id: 'codeforces',
            name: 'Codeforces',
            status: r.found ? 'found' : 'not_found',
            url: r.url,
            data: r.found ? { rating: r.rating } : undefined,
          })
        })
        .catch((e) => {
          connectors.push({ id: 'codeforces', name: 'Codeforces', status: 'error', error: e?.message })
        })
    )
  }

  let npm: Awaited<ReturnType<typeof packagesApi.searchNpm>> | null = null
  tasks.push(
    packagesApi
      .searchNpm(username)
      .then((r) => {
        npm = r
        connectors.push({
          id: 'npm',
          name: 'NPM',
          status: r.length > 0 ? 'found' : 'not_found',
          data: { packages: r.length },
        })
      })
      .catch((e) => {
        connectors.push({ id: 'npm', name: 'NPM', status: 'error', error: e?.message })
      })
  )

  let pypi: Awaited<ReturnType<typeof packagesApi.searchPypi>> | null = null
  tasks.push(
    packagesApi
      .searchPypi(username)
      .then((r) => {
        pypi = r
        connectors.push({
          id: 'pypi',
          name: 'PyPI',
          status: r.length > 0 ? 'found' : 'not_found',
          data: { packages: r.length },
        })
      })
      .catch((e) => {
        connectors.push({ id: 'pypi', name: 'PyPI', status: 'error', error: e?.message })
      })
  )

  let social: Awaited<ReturnType<typeof socialApi.search>> = []
  tasks.push(
    socialApi
      .search({ username, github: githubHandle || username })
      .then((r) => {
        social = r
        connectors.push({
          id: 'social',
          name: 'Social Discovery',
          status: r.some((s) => s.found) ? 'found' : 'not_found',
          data: { platforms: r.filter((s) => s.found).length },
        })
      })
      .catch((e) => {
        connectors.push({ id: 'social', name: 'Social Discovery', status: 'error', error: e?.message })
      })
  )

  await Promise.all(tasks)

  const scores = computeScores({ github: githubResult, website: websiteResult, email: emailResult, social, codeforces, npm, pypi })

  const report: DigitalIdentityReport = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    input,
    createdAt: new Date().toISOString(),
    scores,
    github: githubResult,
    website: websiteResult,
    email: emailResult,
    codeforces,
    npm,
    pypi,
    social,
    connectors,
    aiReport: null, // AI report fetched separately on demand
    durationMs: Date.now() - start,
  }

  // Build a fast fallback AI report so the UI always has something
  report.aiReport = buildFallbackAIReport(report)

  // Persist to history
  try {
    await db.scan.create({
      data: {
        query: input.query,
        queryType: input.type,
        email: input.email ?? null,
        website: input.website ?? null,
        github: input.github ?? null,
        overallScore: scores.overall,
        developerScore: scores.developer,
        portfolioScore: scores.portfolio,
        reportJson: JSON.stringify(report),
        bookmarked: false,
      },
    })
  } catch {
    /* persistence is best-effort */
  }

  return NextResponse.json(report)
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'IdentityScope AI scanner' })
}
