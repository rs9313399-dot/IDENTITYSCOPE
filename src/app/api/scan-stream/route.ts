/**
 * Streaming scan endpoint — emits per-connector progress via SSE.
 * Clients can show which connectors are running, completed, or errored
 * in real-time instead of waiting for the full scan to finish.
 *
 * POST /api/scan-stream  body: { query, github?, email?, website? }
 * Response: text/event-stream
 *   data: {"type":"start","connectors":["github","website",...]}
 *   data: {"type":"progress","connector":"github","status":"found","data":{...}}
 *   data: {"type":"progress","connector":"website","status":"error","error":"..."}
 *   ...
 *   data: {"type":"done","report":{...DigitalIdentityReport}}
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import type { DigitalIdentityReport, ConnectorResult, ScanInput } from '@/lib/types'
import * as githubApi from '@/lib/apis/github'
import * as codeforcesApi from '@/lib/apis/codeforces'
import * as packagesApi from '@/lib/apis/packages'
import * as socialApi from '@/lib/apis/social'
import * as websiteApi from '@/lib/apis/website'
import * as emailApi from '@/lib/apis/email'
import { computeScores, buildFallbackAIReport } from '@/lib/scoring'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const Body = z.object({
  query: z.string().min(1).max(100),
  github: z.string().max(100).optional(),
  email: z.string().max(200).optional(),
  website: z.string().max(500).optional(),
})

function detectQueryType(query: string): ScanInput['type'] {
  const v = query.trim().toLowerCase()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email'
  if (/^https?:\/\//i.test(query) || /^[\w-]+\.[a-z]{2,}(\/|$)/i.test(query)) return 'website'
  return 'username'
}

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await req.json())
  } catch {
    return new Response('Invalid body', { status: 400 })
  }

  const start = Date.now()
  const queryType = detectQueryType(body.query)
  let githubHandle = body.github?.trim() || ''
  let email = body.email?.trim() || ''
  let website = body.website?.trim() || ''
  const username = body.query.trim()

  if (queryType === 'email' && !email) email = username
  if (queryType === 'website' && !website) website = username
  if (queryType === 'username' && !githubHandle) githubHandle = username

  const input: ScanInput = {
    query: username,
    type: queryType,
    github: githubHandle || undefined,
    email: email || undefined,
    website: website || undefined,
  }

  // Determine which connectors will run
  const activeConnectors: string[] = []
  if (githubHandle && githubApi.validate({ github: githubHandle })) activeConnectors.push('GitHub')
  if (website && websiteApi.validate({ website })) activeConnectors.push('Website')
  if (email && emailApi.validate({ email })) activeConnectors.push('Email')
  if (username && codeforcesApi.validate({ query: username })) activeConnectors.push('Codeforces')
  activeConnectors.push('NPM', 'PyPI', 'Social Discovery')

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const connectors: ConnectorResult[] = []

      // Emit start event
      controller.enqueue(
        encoder.encode(sse({ type: 'start', connectors: activeConnectors }))
      )

      // Helper to emit progress for a connector
      function emitProgress(result: ConnectorResult) {
        connectors.push(result)
        controller.enqueue(
          encoder.encode(sse({ type: 'progress', connector: result.id, status: result.status, name: result.name, error: result.error }))
        )
      }

      // Run connectors in parallel, emitting progress as each completes
      const tasks: Promise<void>[] = []

      let github: Awaited<ReturnType<typeof githubApi.search>> | null = null
      if (githubHandle && githubApi.validate({ github: githubHandle })) {
        tasks.push(
          githubApi
            .search({ github: githubHandle })
            .then((r) => {
              github = r
              emitProgress({
                id: 'github', name: 'GitHub', status: 'found', url: r.user.htmlUrl,
                data: { followers: r.user.followers, repos: r.repos.length, stars: r.totalStars },
              })
            })
            .catch((e) => {
              emitProgress({
                id: 'github', name: 'GitHub',
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
              emitProgress({
                id: 'website', name: 'Website', status: r.reachable ? 'found' : 'not_found', url: r.url,
                data: { score: r.score },
              })
            })
            .catch((e) => {
              emitProgress({ id: 'website', name: 'Website', status: 'error', error: e?.message })
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
              emitProgress({
                id: 'email', name: 'Email', status: 'found',
                data: { valid: r.valid, deliverability: r.deliverability },
              })
            })
            .catch((e) => {
              emitProgress({ id: 'email', name: 'Email', status: 'error', error: e?.message })
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
              emitProgress({
                id: 'codeforces', name: 'Codeforces', status: r.found ? 'found' : 'not_found', url: r.url,
              })
            })
            .catch((e) => {
              emitProgress({ id: 'codeforces', name: 'Codeforces', status: 'error', error: e?.message })
            })
        )
      }

      let npm: Awaited<ReturnType<typeof packagesApi.searchNpm>> | null = null
      tasks.push(
        packagesApi
          .searchNpm(username)
          .then((r) => {
            npm = r
            emitProgress({
              id: 'npm', name: 'NPM', status: r.length > 0 ? 'found' : 'not_found',
              data: { packages: r.length },
            })
          })
          .catch((e) => {
            emitProgress({ id: 'npm', name: 'NPM', status: 'error', error: e?.message })
          })
      )

      let pypi: Awaited<ReturnType<typeof packagesApi.searchPypi>> | null = null
      tasks.push(
        packagesApi
          .searchPypi(username)
          .then((r) => {
            pypi = r
            emitProgress({
              id: 'pypi', name: 'PyPI', status: r.length > 0 ? 'found' : 'not_found',
              data: { packages: r.length },
            })
          })
          .catch((e) => {
            emitProgress({ id: 'pypi', name: 'PyPI', status: 'error', error: e?.message })
          })
      )

      let social: Awaited<ReturnType<typeof socialApi.search>> = []
      tasks.push(
        socialApi
          .search({ username, github: githubHandle || username })
          .then((r) => {
            social = r
            emitProgress({
              id: 'social', name: 'Social Discovery',
              status: r.some((s) => s.found) ? 'found' : 'not_found',
              data: { platforms: r.filter((s) => s.found).length },
            })
          })
          .catch((e) => {
            emitProgress({ id: 'social', name: 'Social Discovery', status: 'error', error: e?.message })
          })
      )

      await Promise.all(tasks)

      // Compute scores and build report
      const scores = computeScores({
        github, website: websiteResult, email: emailResult,
        social, codeforces, npm, pypi,
      })

      const report: DigitalIdentityReport = {
        id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        input,
        createdAt: new Date().toISOString(),
        scores,
        github,
        website: websiteResult,
        email: emailResult,
        codeforces,
        npm,
        pypi,
        social,
        connectors,
        aiReport: null,
        durationMs: Date.now() - start,
      }
      report.aiReport = buildFallbackAIReport(report)

      // Persist to DB
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

      // Emit done event
      controller.enqueue(encoder.encode(sse({ type: 'done', report })))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
