/**
 * AI Report endpoint — uses the z-ai-web-dev-sdk LLM to generate a
 * professional digital identity report from the public-data summary.
 *
 * POST /api/ai-report  body: { report: DigitalIdentityReport }
 */

import { NextRequest, NextResponse } from 'next/server'
import type { DigitalIdentityReport, AIReport } from '@/lib/types'
import { summarizeForAI, buildFallbackAIReport } from '@/lib/scoring'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let body: { report: DigitalIdentityReport }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  const report = body.report
  if (!report || !report.scores) {
    return NextResponse.json({ error: 'Missing report' }, { status: 400 })
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
    })
    const raw = completion.choices?.[0]?.message?.content ?? ''
    // Try to extract JSON (the model may wrap in fences despite instructions)
    let jsonText = raw.trim()
    const fence = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fence) jsonText = fence[1].trim()
    const firstBrace = jsonText.indexOf('{')
    const lastBrace = jsonText.lastIndexOf('}')
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1)
    }
    const parsed = JSON.parse(jsonText) as AIReport
    parsed.privacyNote =
      'This AI report was generated from publicly available data only. No private accounts were accessed and no sensitive personal information was collected.'
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('[ai-report] LLM generation failed:', err)
    // Fallback to deterministic report so the UI is never empty
    const fallback = buildFallbackAIReport(report)
    return NextResponse.json(fallback)
  }
}
