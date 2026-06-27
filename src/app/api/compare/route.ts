/**
 * Compare endpoint — runs two scans and returns both reports side by side.
 * POST /api/compare  body: { left: ScanInput, right: ScanInput }
 * Reuses /api/scan logic by importing the orchestration helper.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ScanInput, DigitalIdentityReport } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { left: ScanInput; right: ScanInput }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (!body.left || !body.right) {
    return NextResponse.json({ error: 'left and right required' }, { status: 400 })
  }

  // Call the internal scan logic via fetch to keep a single source of truth
  const base = new URL(req.url).origin
  const [lRes, rRes] = await Promise.all([
    fetch(`${base}/api/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: body.left.query,
        github: body.left.github,
        email: body.left.email,
        website: body.left.website,
      }),
    }),
    fetch(`${base}/api/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: body.right.query,
        github: body.right.github,
        email: body.right.email,
        website: body.right.website,
      }),
    }),
  ])

  const left = (await lRes.json()) as DigitalIdentityReport & { error?: string }
  const right = (await rRes.json()) as DigitalIdentityReport & { error?: string }

  if (left.error || right.error) {
    return NextResponse.json(
      { error: left.error || right.error },
      { status: 400 }
    )
  }
  return NextResponse.json({ left, right })
}
