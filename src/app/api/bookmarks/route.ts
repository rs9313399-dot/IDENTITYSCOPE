/** Bookmarks: PATCH /api/bookmarks?id=<scanId>&bookmarked=true */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = z.object({ bookmarked: z.boolean() }).parse(await req.json().catch(() => ({})))
  try {
    const updated = await db.scan.update({
      where: { id },
      data: { bookmarked: body.bookmarked ?? true },
      select: { id: true, bookmarked: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function GET() {
  const scans = await db.scan.findMany({
    where: { bookmarked: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      query: true,
      queryType: true,
      github: true,
      overallScore: true,
      createdAt: true,
    },
  })
  return NextResponse.json({ scans })
}
