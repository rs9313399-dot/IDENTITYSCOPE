'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GitCompareArrows,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DigitalIdentityReport, ScoreSet } from '@/lib/types'
import { useHistory, loadScanById } from '@/hooks/use-scan'

interface DiffModalProps {
  open: boolean
  onClose: () => void
  currentReport: DigitalIdentityReport | null
}

const SCORE_KEYS: { key: keyof ScoreSet; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'developer', label: 'Developer' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'openSource', label: 'Open Source' },
  { key: 'repository', label: 'Repository' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'security', label: 'Security' },
  { key: 'community', label: 'Community' },
  { key: 'brand', label: 'Brand' },
]

export function DiffModal({ open, onClose, currentReport }: DiffModalProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [pastReport, setPastReport] = React.useState<DigitalIdentityReport | null>(null)
  const [loading, setLoading] = React.useState(false)

  // Fetch scans with the same query
  const { data: historyData } = useHistory(currentReport?.input.query)

  // Filter to same query, exclude current scan, sort oldest-first for selection
  const sameQueryScans = React.useMemo(() => {
    if (!historyData || !currentReport) return []
    return historyData.scans
      .filter((s) => s.query.toLowerCase() === currentReport.input.query.toLowerCase())
      .slice(0, 20) // recent 20
  }, [historyData, currentReport])

  React.useEffect(() => {
    if (!open) {
      setSelectedId(null)
      setPastReport(null)
    }
  }, [open])

  async function loadPast(id: string) {
    setSelectedId(id)
    setLoading(true)
    setPastReport(null)
    const r = await loadScanById(id)
    setPastReport(r)
    setLoading(false)
  }

  if (!open || !currentReport) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md no-print p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <GitCompareArrows className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Compare over time</h3>
                <p className="text-xs text-muted-foreground">
                  Diff <span className="font-mono">{currentReport.input.query}</span> against a past scan
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
            {sameQueryScans.length <= 1 ? (
              <div className="text-center py-12">
                <GitCompareArrows className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">Not enough scans yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Scan <span className="font-mono">{currentReport.input.query}</span> again later to see how the
                  digital identity has changed over time.
                </p>
              </div>
            ) : (
              <>
                {/* Past scan selector */}
                <div className="mb-5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    Select a past scan to compare
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                    {sameQueryScans.slice(1).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => loadPast(s.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          selectedId === s.id ? 'bg-accent/60' : 'hover:bg-accent/30'
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium">
                            {new Date(s.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs tabular-nums"
                        >
                          {s.overallScore ?? '—'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diff results */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}

                {pastReport && !loading && (
                  <DiffResults current={currentReport} past={pastReport} />
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DiffResults({
  current,
  past,
}: {
  current: DigitalIdentityReport
  past: DigitalIdentityReport
}) {
  const daysApart = Math.round(
    (new Date(current.createdAt).getTime() - new Date(past.createdAt).getTime()) / 86400000
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Time range header */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <div className="text-center">
          <div className="font-mono">{new Date(past.createdAt).toLocaleDateString()}</div>
          <div className="text-[10px]">past</div>
        </div>
        <ArrowRight className="h-3.5 w-3.5" />
        <div className="text-center">
          <div className="font-mono">{new Date(current.createdAt).toLocaleDateString()}</div>
          <div className="text-[10px]">now</div>
        </div>
        <Badge variant="secondary" className="ml-2 text-xs">
          {daysApart === 0 ? 'same day' : `${daysApart} day${daysApart === 1 ? '' : 's'} apart`}
        </Badge>
      </div>

      {/* Score diffs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {SCORE_KEYS.map((s) => {
          const pastVal = past.scores[s.key]
          const currVal = current.scores[s.key]
          const delta = currVal - pastVal
          const isUp = delta > 0
          const isDown = delta < 0
          const isFlat = delta === 0
          return (
            <Card key={s.key} className="glass p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {s.label}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tabular-nums">{currVal}</span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {isUp && (
                  <span className="flex items-center gap-0.5 text-emerald-500 font-semibold">
                    <TrendingUp className="h-3 w-3" />+{delta}
                  </span>
                )}
                {isDown && (
                  <span className="flex items-center gap-0.5 text-red-500 font-semibold">
                    <TrendingDown className="h-3 w-3" />{delta}
                  </span>
                )}
                {isFlat && (
                  <span className="flex items-center gap-0.5 text-muted-foreground">
                    <Minus className="h-3 w-3" />0
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">was {pastVal}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* GitHub stats diff */}
      {current.github && past.github && (
        <Card className="glass p-4">
          <h4 className="text-sm font-semibold mb-3">GitHub stats</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatDiff label="Followers" past={past.github.user.followers} curr={current.github.user.followers} />
            <StatDiff label="Stars" past={past.github.totalStars} curr={current.github.totalStars} />
            <StatDiff label="Forks" past={past.github.totalForks} curr={current.github.totalForks} />
            <StatDiff
              label="Contributions"
              past={past.github.contributionYearTotal}
              curr={current.github.contributionYearTotal}
            />
          </div>
        </Card>
      )}

      {/* Summary verdict */}
      <Card className="glass-strong p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.19_265/0.06),transparent_70%)]" />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Verdict
          </div>
          <DiffVerdict current={current} past={past} />
        </div>
      </Card>
    </motion.div>
  )
}

function StatDiff({ label, past, curr }: { label: string; past: number; curr: number }) {
  const delta = curr - past
  const isUp = delta > 0
  const isDown = delta < 0
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold tabular-nums">{curr.toLocaleString()}</div>
      {delta !== 0 && (
        <div
          className={`text-[10px] font-semibold flex items-center gap-0.5 ${
            isUp ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {isUp && <TrendingUp className="h-2.5 w-2.5" />}
          {isDown && <TrendingDown className="h-2.5 w-2.5" />}
          {isUp ? '+' : ''}{delta.toLocaleString()}
        </div>
      )}
    </div>
  )
}

function DiffVerdict({
  current,
  past,
}: {
  current: DigitalIdentityReport
  past: DigitalIdentityReport
}) {
  const overallDelta = current.scores.overall - past.scores.overall
  const starsDelta = (current.github?.totalStars ?? 0) - (past.github?.totalStars ?? 0)
  const followersDelta = (current.github?.user.followers ?? 0) - (past.github?.user.followers ?? 0)

  const improvements: string[] = []
  const declines: string[] = []

  if (overallDelta > 0) improvements.push(`overall score +${overallDelta}`)
  if (overallDelta < 0) declines.push(`overall score ${overallDelta}`)
  if (starsDelta > 0) improvements.push(`${starsDelta.toLocaleString()} new stars`)
  if (followersDelta > 0) improvements.push(`${followersDelta.toLocaleString()} new followers`)
  if (starsDelta < 0) declines.push(`${Math.abs(starsDelta).toLocaleString()} stars lost`)
  if (followersDelta < 0) declines.push(`${Math.abs(followersDelta).toLocaleString()} followers lost`)

  if (improvements.length === 0 && declines.length === 0) {
    return <p className="text-sm text-muted-foreground">No significant changes detected between scans.</p>
  }

  return (
    <div className="space-y-1.5">
      {improvements.length > 0 && (
        <p className="text-sm">
          <span className="text-emerald-500 font-semibold">▲ Improvements:</span>{' '}
          <span className="text-foreground/80">{improvements.join(', ')}</span>
        </p>
      )}
      {declines.length > 0 && (
        <p className="text-sm">
          <span className="text-red-500 font-semibold">▼ Declines:</span>{' '}
          <span className="text-foreground/80">{declines.join(', ')}</span>
        </p>
      )}
    </div>
  )
}
