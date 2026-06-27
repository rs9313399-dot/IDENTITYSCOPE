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

      {/* Metric rows */}
      <Card className="glass p-2">
        {rows.map((row, i) => {
          const leftWins = row.leftVal > row.rightVal
          const rightWins = row.rightVal > row.leftVal
          return (
            <div
              key={row.label}
              className={`grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-4 py-3 ${
                i % 2 === 0 ? 'bg-muted/20' : ''
              } rounded-lg`}
            >
              <div className={`text-right ${leftWins ? 'font-bold' : 'text-muted-foreground'}`}>
                <span style={leftWins ? { color: scoreColor(70) } : undefined}>
                  {row.format(row.leftVal)}
                </span>
              </div>
              <div className="flex flex-col items-center min-w-[110px]">
                <row.icon className="h-3.5 w-3.5 text-muted-foreground mb-0.5" />
                <span className="text-[11px] text-muted-foreground text-center">{row.label}</span>
              </div>
              <div className={`text-left ${rightWins ? 'font-bold' : 'text-muted-foreground'}`}>
                <span style={rightWins ? { color: scoreColor(70) } : undefined}>
                  {row.format(row.rightVal)}
                </span>
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
