/**
 * History endpoints — list, search, get, delete scans.
 * GET  /api/history?q=&limit=
 * GET  /api/history/:id
 * DELETE /api/history/:id
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100)
  const bookmarkedOnly = searchParams.get('bookmarked') === '1'

  const where: { query?: { contains: string }; bookmarked?: boolean } = {}
  if (q) where.query = { contains: q }
  if (bookmarkedOnly) where.bookmarked = true

  try {
    const scans = await db.scan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        query: true,
        queryType: true,
        github: true,
        email: true,
        website: true,
        overallScore: true,
        developerScore: true,
        portfolioScore: true,
        bookmarked: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ scans })
  } catch {
    return NextResponse.json({ scans: [] })
  }
}
