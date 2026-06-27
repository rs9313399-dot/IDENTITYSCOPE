'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Github,
  Globe,
  BookOpen,
  Map,
  Package,
  Loader2,
  RefreshCw,
  Shield,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'
import { useAiReport } from '@/hooks/use-scan'
import { Reveal, ProgressRing, scoreColor } from '@/components/charts/animated'

export function ReportView() {
  const { currentReport: report, setCurrentReport, setView } = useAppStore()
  const ai = useAiReport()

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <Card className="glass p-10">
          <Brain className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No report to analyze</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Run a scan first, then come back to generate an AI identity report.
          </p>
          <Button onClick={() => setView('scanner')}>Start a scan</Button>
        </Card>
      </div>
    )
  }

  const r = report.aiReport
  const overall = report.scores.overall

  function regenerate() {
    if (!report) return
    ai.mutate(report, {
      onSuccess: (data) => {
        setCurrentReport({ ...report, aiReport: data })
      },
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* AI generation overlay */}
      {ai.isPending && <AiGeneratingOverlay />}

      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" /> AI Identity Report
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Digital identity analysis for{' '}
              <span className="font-mono gradient-text">{report.input.query}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generated from public APIs · {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={regenerate} disabled={ai.isPending}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${ai.isPending ? 'animate-spin' : ''}`} />
            Regenerate with AI
          </Button>
        </div>
      </Reveal>

      {/* Hero summary */}
      <Reveal delay={0.05}>
        <Card className="glass-strong p-6 sm:p-8 relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[oklch(0.7_0.25_305/0.1)]" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative grid sm:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="flex justify-center">
              <ProgressRing value={overall} size={150} stroke={12} label="overall" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Developer level</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">{r?.developerLevel ?? '—'}</h2>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {r?.executiveSummary ?? 'AI report unavailable. Click regenerate to try again.'}
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Reveal delay={0.1}>
          <Card className="glass p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Strengths</h3>
            </div>
            {r?.strengths?.length ? (
              <ul className="space-y-2.5">
                {r.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths recorded.</p>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="glass p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Weaknesses</h3>
            </div>
            {r?.weaknesses?.length ? (
              <ul className="space-y-2.5">
                {r.weaknesses.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <XCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No weaknesses recorded.</p>
            )}
          </Card>
        </Reveal>
      </div>

      {/* Suggestions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SuggestionCard icon={TrendingUp} title="Career suggestions" color="oklch(0.72 0.19 265)" items={r?.careerSuggestions} />
        <SuggestionCard icon={FileText} title="Resume suggestions" color="oklch(0.7 0.25 305)" items={r?.resumeSuggestions} />
        <SuggestionCard icon={Globe} title="Portfolio suggestions" color="oklch(0.76 0.17 165)" items={r?.portfolioSuggestions} />
        <SuggestionCard icon={Github} title="GitHub improvements" color="oklch(0.78 0.17 85)" items={r?.githubImprovements} />
        <SuggestionCard icon={Package} title="Open source suggestions" color="oklch(0.7 0.19 22)" items={r?.openSourceSuggestions} />
        <SuggestionCard icon={BookOpen} title="Privacy note" color="oklch(0.55 0.1 250)" items={r?.privacyNote ? [r.privacyNote] : undefined} />
      </div>

      {/* Learning roadmap */}
      {r?.learningRoadmap && r.learningRoadmap.length > 0 && (
        <Reveal delay={0.2}>
          <Card className="glass p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Map className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Learning roadmap</h3>
            </div>
            <div className="space-y-4">
              {r.learningRoadmap.map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    {i < r.learningRoadmap!.length - 1 && (
                      <div className="w-px flex-1 bg-border/60 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-sm mb-2">{phase.phase}</h4>
                    <ul className="space-y-1.5">
                      {phase.items.map((item, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </Reveal>
      )}

      {/* Privacy footer */}
      <Reveal delay={0.25}>
        <div className="glass rounded-2xl p-5 flex items-start gap-3">
          <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">Privacy-first.</strong> This report was generated
            entirely from publicly available data via official public APIs. No private accounts
            were accessed, no authentication was bypassed, and no sensitive personal information
            was collected. AI suggestions are based on the public-data summary only.
          </div>
        </div>
      </Reveal>

      <div className="mt-6 flex justify-center gap-2 no-print">
        <Button variant="outline" onClick={() => setView('dashboard')}>
          ← Back to dashboard
        </Button>
        <Button onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-1.5" /> Export PDF
        </Button>
      </div>
    </div>
  )
}

function SuggestionCard({
  icon: Icon,
  title,
  color,
  items,
}: {
  icon: React.ElementType
  title: string
  color: string
  items?: string[]
}) {
  return (
    <Card className="glass p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, color }}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="text-sm flex items-start gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
              <span className="text-muted-foreground">{s}</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No suggestions available.</p>
      )}
    </Card>
  )
}

/** Animated overlay shown while Gemini is generating the AI report (~10-16s). */
function AiGeneratingOverlay() {
  const [elapsed, setElapsed] = React.useState(0)
  React.useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 200)
    return () => clearInterval(id)
  }, [])

  const steps = [
    { label: 'Summarizing public-data signals', delay: 0 },
    { label: 'Identifying strengths & weaknesses', delay: 1.5 },
    { label: 'Generating career suggestions', delay: 3 },
    { label: 'Building learning roadmap', delay: 5 },
    { label: 'Finalizing report', delay: 7 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm no-print"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-strong rounded-3xl p-10 max-w-md w-full mx-4 text-center"
      >
        {/* Animated brain icon */}
        <div className="relative mx-auto h-20 w-20 mb-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.7_0.25_305)] flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        </div>

        <h3 className="font-bold text-lg mb-1">Generating AI report…</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Gemini is analyzing the public-data summary · {elapsed}s elapsed
        </p>

        {/* Animated steps */}
        <div className="space-y-2 text-left">
          {steps.map((step, i) => {
            const active = elapsed >= step.delay
            const current = active && elapsed < (steps[i + 1]?.delay ?? Infinity)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2.5 text-xs"
              >
                {current ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                ) : active ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span className={active ? 'text-foreground' : 'text-muted-foreground'}>
                  {step.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
