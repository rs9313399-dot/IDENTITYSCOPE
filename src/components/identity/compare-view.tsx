'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  GitCompareArrows,
  Github,
  Globe,
  Mail,
  Loader2,
  Zap,
  Users,
  Star,
  GitFork,
  Trophy,
  TrendingUp,
  ArrowLeftRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore } from '@/stores/app-store'
import { useScan } from '@/hooks/use-scan'
import { Reveal, ProgressRing, scoreColor, AnimatedCounter } from '@/components/charts/animated'
import { ScoreRadar } from '@/components/charts'
import type { DigitalIdentityReport, ScoreSet } from '@/lib/types'

interface SideState {
  label: string
  query: string
}

export function CompareView() {
  const { comparePair, setCompare, setCurrentReport, setView } = useAppStore()
  const scan = useScan()
  const [left, setLeft] = React.useState<SideState>({ label: 'left', query: '' })
  const [right, setRight] = React.useState<SideState>({ label: 'right', query: '' })

  async function runScan(side: 'left' | 'right', query: string) {
    if (!query.trim()) return
    try {
      const r = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      }).then((res) => res.json() as Promise<DigitalIdentityReport>)
      setCompare(side, r)
    } catch {
      /* handled by toast elsewhere */
    }
  }

  const l = comparePair.left
  const r = comparePair.right

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <Reveal>
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 gap-1.5">
            <GitCompareArrows className="h-3 w-3" /> Compare mode
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Compare two <span className="gradient-text">digital identities</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Run side-by-side scans to compare followers, stars, languages and scores.
          </p>
        </div>
      </Reveal>

      {/* Inputs */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(['left', 'right'] as const).map((side) => (
            <Card key={side} className="glass p-5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                {side === 'left' ? 'Developer A' : 'Developer B'}
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder={side === 'left' ? 'e.g. torvalds' : 'e.g. gaearon'}
                  value={side === 'left' ? left.query : right.query}
                  onChange={(e) =>
                    side === 'left'
                      ? setLeft((s) => ({ ...s, query: e.target.value }))
                      : setRight((s) => ({ ...s, query: e.target.value }))
                  }
                  className="h-11 glass"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runScan(side, side === 'left' ? left.query : right.query)
                  }}
                />
                <Button
                  onClick={() => runScan(side, side === 'left' ? left.query : right.query)}
                  disabled={scan.isPending}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Reveal>

      {l && r ? (
        <ComparisonView left={l} right={r} onOpenReport={(r) => { setCurrentReport(r); setView('dashboard') }} />
      ) : (
        <Card className="glass p-10 text-center">
          <ArrowLeftRight className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Run scans on both sides</h3>
          <p className="text-sm text-muted-foreground">
            Enter a username or GitHub handle above for each developer to see the comparison.
          </p>
        </Card>
      )}
    </div>
  )
}

function ComparisonView({
  left,
  right,
  onOpenReport,
}: {
  left: DigitalIdentityReport
  right: DigitalIdentityReport
  onOpenReport: (r: DigitalIdentityReport) => void
}) {
  const rows: CompareRow[] = [
    {
      label: 'Overall score',
      icon: Trophy,
      leftVal: left.scores.overall,
      rightVal: right.scores.overall,
      format: (v) => `${v}/100`,
    },
    {
      label: 'Followers',
      icon: Users,
      leftVal: left.github?.user.followers ?? 0,
      rightVal: right.github?.user.followers ?? 0,
      format: (v) => v.toLocaleString(),
    },
    {
      label: 'Public repos',
      icon: Github,
      leftVal: left.github?.user.publicRepos ?? 0,
      rightVal: right.github?.user.publicRepos ?? 0,
      format: (v) => v.toLocaleString(),
    },
    {
      label: 'Total stars',
      icon: Star,
      leftVal: left.github?.totalStars ?? 0,
      rightVal: right.github?.totalStars ?? 0,
      format: (v) => v.toLocaleString(),
    },
    {
      label: 'Total forks',
      icon: GitFork,
      leftVal: left.github?.totalForks ?? 0,
      rightVal: right.github?.totalForks ?? 0,
      format: (v) => v.toLocaleString(),
    },
    {
      label: 'Developer score',
      icon: TrendingUp,
      leftVal: left.scores.developer,
      rightVal: right.scores.developer,
      format: (v) => `${v}/100`,
    },
    {
      label: 'Open source score',
      icon: Github,
      leftVal: left.scores.openSource,
      rightVal: right.scores.openSource,
      format: (v) => `${v}/100`,
    },
    {
      label: 'Documentation score',
      icon: Github,
      leftVal: left.scores.documentation,
      rightVal: right.scores.documentation,
      format: (v) => `${v}/100`,
    },
    {
      label: 'Community score',
      icon: Users,
      leftVal: left.scores.community,
      rightVal: right.scores.community,
      format: (v) => `${v}/100`,
    },
    {
      label: 'Brand score',
      icon: Trophy,
      leftVal: left.scores.brand,
      rightVal: right.scores.brand,
      format: (v) => `${v}/100`,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <ProfileHeader report={left} onOpen={() => onOpenReport(left)} align="right" />
        <div className="text-center">
          <div className="h-10 w-10 rounded-full glass flex items-center justify-center mx-auto">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">vs</div>
        </div>
        <ProfileHeader report={right} onOpen={() => onOpenReport(right)} align="left" />
      </div>

      {/* Score rings */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="flex justify-center">
          <ProgressRing value={left.scores.overall} size={130} stroke={11} label="overall" />
        </div>
        <div className="text-center text-xs text-muted-foreground">Overall</div>
        <div className="flex justify-center">
          <ProgressRing value={right.scores.overall} size={130} stroke={11} label="overall" />
        </div>
      </div>

      {/* Radar comparison */}
      <Card className="glass p-6">
        <h3 className="text-sm font-semibold mb-3 text-center">Score dimension comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground text-center mb-1">{left.input.query}</div>
            <ScoreRadar scores={left.scores} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground text-center mb-1">{right.input.query}</div>
            <ScoreRadar scores={right.scores} />
          </div>
        </div>
      </Card>

      {/* Verdict banner */}
      <VerdictBanner left={left} right={right} rows={rows} />

      {/* Metric rows */}
      <Card className="glass p-2 overflow-hidden">
        {rows.map((row, i) => {
          const leftWins = row.leftVal > row.rightVal
          const rightWins = row.rightVal > row.leftVal
          const tie = row.leftVal === row.rightVal
          // Normalized bar widths (proportional to the larger value)
          const total = row.leftVal + row.rightVal || 1
          const leftPct = tie ? 50 : (row.leftVal / total) * 100
          const rightPct = tie ? 50 : (row.rightVal / total) * 100
          return (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-4 py-3.5 ${
                i % 2 === 0 ? 'bg-muted/15' : ''
              } rounded-lg transition-colors hover:bg-accent/30`}
            >
              {/* Left value + bar */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5">
                  {leftWins && (
                    <motion.span
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'oklch(0.72 0.19 165 / 0.15)', color: 'oklch(0.72 0.19 165)' }}
                    >
                      <Trophy className="h-2.5 w-2.5" /> WIN
                    </motion.span>
                  )}
                  <span
                    className={`text-lg tabular-nums ${leftWins ? 'font-extrabold' : 'font-medium text-muted-foreground'}`}
                    style={leftWins ? { color: 'oklch(0.72 0.19 165)' } : undefined}
                  >
                    {row.format(row.leftVal)}
                  </span>
                </div>
                {/* Mini bar */}
                <div className="w-full h-1 rounded-full bg-muted/40 overflow-hidden max-w-[180px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${leftPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                    className="h-full rounded-full"
                    style={{
                      background: leftWins
                        ? 'linear-gradient(90deg, oklch(0.72 0.19 165), oklch(0.7 0.2 180))'
                        : 'oklch(0.5 0.1 250 / 0.4)',
                    }}
                  />
                </div>
              </div>
              {/* Center label */}
              <div className="flex flex-col items-center min-w-[100px] px-2">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center mb-0.5 ${
                    tie ? 'bg-muted/40 text-muted-foreground' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <row.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-wider">
                  {row.label}
                </span>
                {tie && (
                  <span className="text-[9px] text-muted-foreground/60 mt-0.5">tie</span>
                )}
              </div>
              {/* Right value + bar */}
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-lg tabular-nums ${rightWins ? 'font-extrabold' : 'font-medium text-muted-foreground'}`}
                    style={rightWins ? { color: 'oklch(0.72 0.19 165)' } : undefined}
                  >
                    {row.format(row.rightVal)}
                  </span>
                  {rightWins && (
                    <motion.span
                      initial={{ scale: 0, rotate: 20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'oklch(0.72 0.19 165 / 0.15)', color: 'oklch(0.72 0.19 165)' }}
                    >
                      <Trophy className="h-2.5 w-2.5" /> WIN
                    </motion.span>
                  )}
                </div>
                {/* Mini bar */}
                <div className="w-full h-1 rounded-full bg-muted/40 overflow-hidden max-w-[180px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rightPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.04 }}
                    className="h-full rounded-full ml-auto"
                    style={{
                      background: rightWins
                        ? 'linear-gradient(90deg, oklch(0.7 0.2 180), oklch(0.72 0.19 165))'
                        : 'oklch(0.5 0.1 250 / 0.4)',
                      marginLeft: 'auto',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </Card>

      {/* Languages comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[left, right].map((rep, idx) => (
          <Card key={idx} className="glass p-5">
            <h4 className="text-sm font-semibold mb-3">Top languages — {rep.input.query}</h4>
            {rep.github && rep.github.languages.length > 0 ? (
              <div className="space-y-2">
                {rep.github.languages.slice(0, 6).map((l) => (
                  <div key={l.language}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{l.language}</span>
                      <span className="text-muted-foreground">{l.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${l.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: l.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No language data</p>
            )}
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

interface CompareRow {
  label: string
  icon: React.ElementType
  leftVal: number
  rightVal: number
  format: (v: number) => string
}

function ProfileHeader({
  report,
  onOpen,
  align,
}: {
  report: DigitalIdentityReport
  onOpen: () => void
  align: 'left' | 'right'
}) {
  const g = report.github
  return (
    <button
      onClick={onOpen}
      className={`glass rounded-2xl p-4 flex items-center gap-3 hover:glow transition-all w-full ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      {g && (
        <Avatar className="h-12 w-12 border-2 border-primary/30 shrink-0">
          <AvatarImage src={g.user.avatarUrl} alt={g.user.login} />
          <AvatarFallback>{g.user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className={align === 'right' ? 'text-right' : ''}>
        <div className="font-semibold text-sm truncate">{g?.user.name || report.input.query}</div>
        <div className="text-xs text-muted-foreground font-mono truncate">@{g?.user.login ?? report.input.query}</div>
      </div>
    </button>
  )
}

function VerdictBanner({
  left,
  right,
  rows,
}: {
  left: DigitalIdentityReport
  right: DigitalIdentityReport
  rows: CompareRow[]
}) {
  // Count wins
  let leftWins = 0
  let rightWins = 0
  let ties = 0
  for (const r of rows) {
    if (r.leftVal > r.rightVal) leftWins++
    else if (r.rightVal > r.leftVal) rightWins++
    else ties++
  }
  const winner = leftWins > rightWins ? 'left' : rightWins > leftWins ? 'right' : 'tie'
  const winnerName =
    winner === 'left'
      ? left.github?.user.name || left.input.query
      : winner === 'right'
        ? right.github?.user.name || right.input.query
        : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-strong p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.19_265/0.06),transparent_70%)]" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  winner === 'tie'
                    ? 'oklch(0.55 0.1 250 / 0.15)'
                    : 'oklch(0.72 0.19 165 / 0.15)',
                color: winner === 'tie' ? 'oklch(0.6 0.1 250)' : 'oklch(0.72 0.19 165)',
              }}
            >
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Head-to-head verdict
              </div>
              {winner === 'tie' ? (
                <div className="text-lg font-bold">
                  It's a <span className="gradient-text">tie</span>!
                </div>
              ) : (
                <div className="text-lg font-bold">
                  <span className="gradient-text">{winnerName}</span> leads
                </div>
              )}
            </div>
          </div>
          {/* Win count bars */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold tabular-nums" style={{ color: 'oklch(0.72 0.19 165)' }}>
                {leftWins}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {left.github?.user.login ?? left.input.query} wins
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold tabular-nums text-muted-foreground">{ties}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">ties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-extrabold tabular-nums" style={{ color: 'oklch(0.72 0.19 165)' }}>
                {rightWins}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {right.github?.user.login ?? right.input.query} wins
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
