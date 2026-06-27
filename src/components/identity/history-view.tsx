'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Bookmark,
  ExternalLink,
  Github,
  Globe,
  Mail,
  AtSign,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { useHistory, loadScanById, deleteScan, toggleBookmark } from '@/hooks/use-scan'
import { Reveal, scoreColor, scoreLabel } from '@/components/charts/animated'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const TYPE_ICON = {
  username: AtSign,
  github: Github,
  website: Globe,
  email: Mail,
} as const

export function HistoryView() {
  const [q, setQ] = React.useState('')
  const { data, isLoading, refetch } = useHistory(q)
  const { setCurrentReport, setView } = useAppStore()
  const qc = useQueryClient()

  async function open(scanId: string) {
    const report = await loadScanById(scanId)
    if (!report) {
      toast.error('Could not load report')
      return
    }
    setCurrentReport(report)
    setView('dashboard')
  }

  async function remove(scanId: string) {
    await deleteScan(scanId)
    toast.success('Scan deleted')
    refetch()
    qc.invalidateQueries({ queryKey: ['bookmarks'] })
  }

  async function bookmark(scanId: string, current: boolean) {
    await toggleBookmark(scanId, !current)
    refetch()
    qc.invalidateQueries({ queryKey: ['bookmarks'] })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5">
              <HistoryIcon className="h-3 w-3" /> Search history
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your scans</h1>
            <p className="text-sm text-muted-foreground mt-1">
              All scans are saved locally to your browser history.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search scans…"
              className="pl-9 glass"
            />
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <Card className="glass p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        </Card>
      ) : !data || data.scans.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No scans yet</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Run your first scan to start building your digital identity history.
          </p>
          <Button onClick={() => setView('scanner')}>Start a scan</Button>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {data.scans.map((s, i) => {
            const Icon = TYPE_ICON[s.queryType as keyof typeof TYPE_ICON] ?? AtSign
            const score = s.overallScore ?? 0
            return (
              <Reveal key={s.id} delay={Math.min(i * 0.03, 0.3)}>
                <Card className="glass p-4 hover:glow transition-all group">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${scoreColor(score)}22`, color: scoreColor(score) }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <button onClick={() => open(s.id)} className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold font-mono truncate">{s.query}</span>
                        <Badge variant="outline" className="text-xs capitalize">{s.queryType}</Badge>
                        {s.bookmarked && (
                          <Badge variant="secondary" className="text-xs gap-1 text-amber-500">
                            <Bookmark className="h-3 w-3 fill-amber-500" /> Saved
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(s.createdAt).toLocaleString()}
                        {s.github && <span className="ml-2">· @{s.github}</span>}
                      </div>
                    </button>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold tabular-nums" style={{ color: scoreColor(score) }}>
                        {score}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {scoreLabel(score)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => bookmark(s.id, s.bookmarked)}>
                        <Bookmark className={`h-3.5 w-3.5 ${s.bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => open(s.id)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => remove(s.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Reveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
