'use client'

import * as React from 'react'
import { Bookmark, Inbox, Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { useBookmarks, loadScanById } from '@/hooks/use-scan'
import { Reveal, scoreColor, scoreLabel } from '@/components/charts/animated'
import { toast } from 'sonner'

export function BookmarksView() {
  const { data, isLoading } = useBookmarks()
  const { setCurrentReport, setView } = useAppStore()

  async function open(scanId: string) {
    const report = await loadScanById(scanId)
    if (!report) {
      toast.error('Could not load report')
      return
    }
    setCurrentReport(report)
    setView('dashboard')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Reveal>
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 gap-1.5">
            <Bookmark className="h-3 w-3" /> Bookmarks
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Saved reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reports you've bookmarked for later reference.
          </p>
        </div>
      </Reveal>

      {isLoading ? (
        <Card className="glass p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        </Card>
      ) : !data || data.scans.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No bookmarks yet</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Bookmark reports from the dashboard to save them here.
          </p>
          <Button onClick={() => setView('history')}>Browse history</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.scans.map((s, i) => {
            const score = s.overallScore ?? 0
            return (
              <Reveal key={s.id} delay={Math.min(i * 0.05, 0.3)}>
                <Card className="glass p-5 hover:glow transition-all group h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs gap-1 text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold tabular-nums" style={{ color: scoreColor(score) }}>
                        {score}
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground">{scoreLabel(score)}</div>
                    </div>
                  </div>
                  <button onClick={() => open(s.id)} className="flex-1 text-left">
                    <div className="font-semibold font-mono text-sm truncate group-hover:text-primary">
                      {s.query}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                    {s.github && (
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">@{s.github}</div>
                    )}
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => open(s.id)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open
                  </Button>
                </Card>
              </Reveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
