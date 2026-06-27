/**
 * Streaming AI Report endpoint.
 * Streams Gemini tokens via Server-Sent Events so the client can show
 * the report being written live instead of waiting 10-16s.
 *
 * POST /api/ai-report-stream  body: { report: DigitalIdentityReport }
 * Response: text/event-stream
 *   data: {"type":"token","content":"..."}
 *   data: {"type":"done","report": {...AIReport}}
 *   data: {"type":"error","message":"..."}
 */

import { NextRequest } from 'next/server'
import type { DigitalIdentityReport, AIReport } from '@/lib/types'
import { summarizeForAI, buildFallbackAIReport } from '@/lib/scoring'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(req: NextRequest) {
  let body: { report: DigitalIdentityReport }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid body', { status: 400 })
  }
  const report = body.report
  if (!report || !report.scores) {
    return new Response('Missing report', { status: 400 })
  }

  const summary = summarizeForAI(report)

  const systemPrompt = `You are IdentityScope AI, an expert career coach and developer-brand strategist.
You receive a privacy-first summary of a developer's PUBLIC digital identity (GitHub, website, email validation, social discovery, package registries).
You MUST:
- Only reference publicly available signals present in the summary.
- Be specific, actionable and professional. Avoid generic platitudes.
- Respect privacy: never speculate about private data, salary, or personal life.
- Return STRICT JSON only (no markdown fences, no prose outside JSON).`

  const userPrompt = `Produce a JSON digital identity report with EXACTLY this shape:
{
  "executiveSummary": "string (3-5 sentences)",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "developerLevel": "string (e.g. Senior Engineer)",
  "careerSuggestions": ["string", ...],
  "resumeSuggestions": ["string", ...],
  "portfolioSuggestions": ["string", ...],
  "githubImprovements": ["string", ...],
  "learningRoadmap": [{ "phase": "string", "items": ["string", ...] }, ...],
  "openSourceSuggestions": ["string", ...]
}

Be concrete and reference the real numbers/handles from the summary.

Here is the summary:
${summary}`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default
        const zai = await ZAI.create()
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1800,
          stream: true,
        })

        let fullText = ''
        for await (const chunk of completion) {
          // Reconstruct the string from the byte-array-like chunk
          let str = ''
          if (typeof chunk === 'string') {
            str = chunk
          } else if (chunk && typeof chunk === 'object') {
            const keys = Object.keys(chunk)
              .filter((k) => /^\d+$/.test(k))
              .sort((a, b) => Number(a) - Number(b))
            if (keys.length > 0) {
              str = keys.map((k) => String.fromCharCode((chunk as Record<string, number>)[k])).join('')
            } else {
              str = JSON.stringify(chunk)
            }
          }
          // Parse SSE lines
          for (const line of str.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              try {
                const json = JSON.parse(data)
                const delta = json.choices?.[0]?.delta?.content
                if (delta) {
                  fullText += delta
                  controller.enqueue(encoder.encode(sse({ type: 'token', content: delta })))
                }
              } catch {
                /* skip unparseable lines */
              }
            }
          }
        }

        // Try to parse the accumulated JSON
        let jsonText = fullText.trim()
        const fence = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/i)
        if (fence) jsonText = fence[1].trim()
        const firstBrace = jsonText.indexOf('{')
        const lastBrace = jsonText.lastIndexOf('}')
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          jsonText = jsonText.slice(firstBrace, lastBrace + 1)
        }
        try {
          const parsed = JSON.parse(jsonText) as AIReport
          parsed.privacyNote =
            'This AI report was generated from publicly available data only. No private accounts were accessed and no sensitive personal information was collected.'
          controller.enqueue(encoder.encode(sse({ type: 'done', report: parsed })))
        } catch {
          // JSON parse failed — send fallback
          const fallback = buildFallbackAIReport(report)
          controller.enqueue(
            encoder.encode(sse({ type: 'done', report: fallback, fallback: true }))
          )
        }
      } catch (err) {
        console.error('[ai-report-stream] error:', err)
        const fallback = buildFallbackAIReport(report)
        controller.enqueue(
          encoder.encode(
            sse({ type: 'error', message: err instanceof Error ? err.message : 'unknown', report: fallback })
          )
        )
      } finally {
        controller.close()
      }
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
