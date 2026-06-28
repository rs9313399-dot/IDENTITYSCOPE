'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ScanSearch,
  Github,
  Globe,
  Mail,
  Shield,
  Zap,
  Brain,
  GitCompareArrows,
  FileDown,
  Lock,
  ArrowRight,
  BarChart3,
  Users,
  Code2,
  Activity,
  Eye,
  BookOpen,
  Package,
  Trophy,
  CheckCircle2,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { useConnectors } from '@/hooks/use-scan'
import { Reveal, AnimatedCounter } from '@/components/charts/animated'
import { TerminalPanel, AsciiSeparator, BgText, StatusTag } from '@/components/identity/cyber-elements'

const FEATURES = [
  { icon: Github, title: 'GITHUB_INTEL', desc: 'Repos, languages, contribution heatmap, README quality, repo health, best/worst projects.' },
  { icon: Globe, title: 'PORTFOLIO_SCAN', desc: 'Performance, SEO, accessibility, security headers, tech stack from public HTTP.' },
  { icon: Mail, title: 'EMAIL_VERIFY', desc: 'Format, disposable detection, MX record verification via DNS-over-HTTPS.' },
  { icon: Users, title: 'SOCIAL_DISCOVERY', desc: '9+ platforms — GitHub, Reddit, Dev.to, Hashnode, Medium, Kaggle, SO, HN, GitLab, Mastodon.' },
  { icon: Brain, title: 'AI_VERDICT', desc: 'Gemini executive summary, career suggestions, learning roadmap, resume tips.' },
  { icon: GitCompareArrows, title: 'COMPARE_MODE', desc: 'Side-by-side developer VS developer with winner badges.' },
  { icon: BarChart3, title: 'RAW_VISUALS', desc: 'Radar, pie, bar charts, block meters, contribution calendar.' },
  { icon: FileDown, title: 'EXPORT', desc: 'Markdown / JSON export, shareable reports, PDF print.' },
]

const STATS = [
  { value: 15, suffix: '+', label: 'PUBLIC_APIS', icon: Code2 },
  { value: 9, suffix: '+', label: 'PLATFORMS', icon: Users },
  { value: 10, suffix: '', label: 'SCORE_DIMS', icon: BarChart3 },
  { value: 100, suffix: '%', label: 'PRIVACY', icon: Shield },
]

const SCORE_DIMENSIONS = [
  'Developer', 'Portfolio', 'Open Source', 'Repository', 'Documentation',
  'Consistency', 'Security', 'Community', 'Brand', 'Overall',
]

const HOW_IT_WORKS = [
  { step: '01', icon: ScanSearch, title: 'INPUT_QUERY', desc: 'Username, GitHub handle, website URL, or email.' },
  { step: '02', icon: Zap, title: 'CONNECTORS_RUN', desc: '15+ public APIs queried with retry, caching & rate-limit handling.' },
  { step: '03', icon: BarChart3, title: 'SCORES_COMPUTED', desc: '10-dimension scoring from real public signals.' },
  { step: '04', icon: Brain, title: 'AI_GENERATES', desc: 'Gemini summarizes into an actionable dossier.' },
]

export function LandingView() {
  const setView = useAppStore((s) => s.setView)
  const { data: connectorsData } = useConnectors()

  return (
    <div className="relative">
      {/* Hero — cyber investigation tool */}
      <section className="relative border-b-[3px] border-border overflow-hidden">
        <BgText className="top-10 -left-10">SCAN</BgText>
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center">
            {/* Left — massive headline */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-8"
              >
                <span className="inline-flex items-center gap-2 border-2 border-border px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest">
                  <Lock className="h-3 w-3" strokeWidth={2.5} />
                  PUBLIC_IDENTITY_SCANNER
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 bg-accent animate-pulse" />
                  ONLINE
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[3rem] sm:text-[5rem] lg:text-[6.5rem] font-black uppercase tracking-tight leading-[0.85]"
              >
                SCAN YOUR<br />
                PUBLIC INTERNET<br />
                <span className="text-accent">IDENTITY.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed font-mono"
              >
                {'>'} Enter a username. IdentityScope scans public developer platforms,
                APIs, profiles, repositories, and public signals to generate a brutal
                identity report.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Button
                  size="lg"
                  onClick={() => setView('scanner')}
                  className="h-14 px-8 text-sm border-[3px] border-accent bg-accent text-background hover:bg-background hover:text-accent font-mono font-bold uppercase tracking-wider group"
                >
                  <Zap className="h-4 w-4 mr-2.5" strokeWidth={2.5} />
                  START_SCAN
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setView('about')}
                  className="h-14 px-8 text-sm border-[3px] border-border bg-background text-foreground hover:bg-foreground hover:text-background font-mono font-bold uppercase tracking-wider"
                >
                  <Eye className="h-4 w-4 mr-2" strokeWidth={2.5} />
                  HOW_IT_WORKS
                </Button>
              </motion.div>
            </div>

            {/* Right — terminal preview box with animated typing scan log */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnimatedTerminalPreview />
            </motion.div>
          </div>

          {/* Stats — editorial grid */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 border-[3px] border-border">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={0.6 + i * 0.08}>
                <div
                  className="p-5 border-r-[3px] border-border last:border-r-0 sm:border-b-0 border-b-[3px] sm:border-b-0"
                  style={{ borderRightWidth: i < STATS.length - 1 ? 3 : 0 }}
                >
                  <s.icon className="h-5 w-5 mb-3 text-accent" strokeWidth={2} />
                  <div className="text-3xl sm:text-4xl font-black tabular-nums">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mt-2">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Input types */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12 border-b-[3px] border-border">
        <Reveal>
          <div className="mb-6">
            <span className="label-brutal-accent">{'// 01 — INPUT_TYPES'}</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2">
              SCAN ANYTHING
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-border">
          {[
            { icon: Github, label: 'GITHUB', hint: '@username', example: 'torvalds' },
            { icon: Globe, label: 'WEBSITE', hint: 'yoursite.com', example: 'vercel.com' },
            { icon: Mail, label: 'EMAIL', hint: 'you@domain.com', example: 'validate' },
            { icon: ScanSearch, label: 'USERNAME', hint: 'cross-platform', example: 'sindresorhus' },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <button
                onClick={() => setView('scanner')}
                className="group w-full p-5 text-left border-r-[3px] border-b-[3px] sm:border-b-0 last:border-r-0 lg:border-b-0 border-border hover:bg-accent hover:text-background transition-colors"
                style={{ borderRightWidth: i < 3 ? 3 : 0 }}
              >
                <c.icon className="h-6 w-6 mb-3" strokeWidth={2} />
                <div className="font-mono font-bold text-sm uppercase tracking-wide">{c.label}</div>
                <div className="text-xs font-mono mt-1 opacity-60">{c.hint}</div>
                <div className="text-[10px] font-mono mt-3 opacity-0 group-hover:opacity-70 transition-opacity">
                  {'>'} TRY: {c.example}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12 border-b-[3px] border-border">
        <Reveal>
          <div className="mb-6">
            <span className="label-brutal-accent">{'// 02 — PROCESS'}</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2">
              EXECUTION_PIPELINE
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-border">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div
                className="relative p-5 border-r-[3px] border-b-[3px] sm:border-b-0 last:border-r-0 lg:border-b-0 border-border group hover:bg-secondary transition-colors"
                style={{ borderRightWidth: i < 3 ? 3 : 0 }}
              >
                <div className="text-5xl font-black text-border absolute top-1 right-2 select-none opacity-20 font-mono">
                  {step.step}
                </div>
                <div className="relative">
                  <step.icon className="h-7 w-7 mb-3 text-accent" strokeWidth={2} />
                  <h3 className="font-mono font-bold uppercase tracking-wide text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-mono">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12 border-b-[3px] border-border">
        <Reveal>
          <div className="mb-6">
            <span className="label-brutal-accent">{'// 03 — CAPABILITIES'}</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2">
              RAW_SIGNALS
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-border">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.06}>
              <div
                className="p-5 border-r-[3px] border-b-[3px] sm:border-b-0 last:border-r-0 lg:border-b-0 border-border group hover:bg-accent hover:text-background transition-colors"
                style={{
                  borderRightWidth: i % 4 !== 3 ? 3 : 0,
                  borderBottomWidth: i < FEATURES.length - 4 ? 3 : 0,
                }}
              >
                <f.icon className="h-6 w-6 mb-3 group-hover:text-background text-accent" strokeWidth={2} />
                <h3 className="font-mono font-bold uppercase tracking-wide text-sm mb-2">{f.title}</h3>
                <p className="text-xs opacity-70 leading-relaxed font-mono">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Score dimensions */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12 border-b-[3px] border-border">
        <div className="grid lg:grid-cols-2 gap-0 border-[3px] border-border">
          <div className="p-8 sm:p-10 border-r-[3px] border-border">
            <span className="label-brutal-accent">{'// 04 — SCORING'}</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-2 mb-4">
              10 DIMENSIONS.<br />ONE SCORE.
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-mono">
              {'>'} Every report scored across developer, portfolio, open-source,
              documentation, consistency, security, community, brand — each computed
              from real public signals.
            </p>
            <div className="flex flex-col gap-2">
              {[
                { icon: Trophy, label: 'DEVELOPER_SCORE', desc: 'Followers, repos, stars, age' },
                { icon: Activity, label: 'CONSISTENCY_SCORE', desc: 'Contribution frequency' },
                { icon: Shield, label: 'SECURITY_SCORE', desc: 'HTTPS, headers, email' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 border-2 border-border p-2.5">
                  <item.icon className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wide">{item.label}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setView('scanner')}
              className="mt-6 border-[3px] border-accent bg-accent text-background hover:bg-background hover:text-accent font-mono font-bold uppercase tracking-wider"
            >
              {'>'} EXECUTE_SCAN <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2.5} />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-0">
            {SCORE_DIMENSIONS.map((d, i) => (
              <motion.div
                key={d}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="p-4 border-r-[3px] border-b-[3px] last:border-r-0 border-border flex items-center gap-2.5 hover:bg-secondary transition-colors"
                style={{
                  borderRightWidth: i % 2 !== 1 ? 3 : 0,
                  borderBottomWidth: i < SCORE_DIMENSIONS.length - 2 ? 3 : 0,
                }}
              >
                <span className="font-mono font-bold text-[10px] text-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wide">{d}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      {connectorsData && (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12 border-b-[3px] border-border">
          <Reveal>
            <div className="mb-6">
              <span className="label-brutal-accent">{'// 05 — CONNECTORS'}</span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2">
                {connectorsData.connectors.length} PUBLIC_API_CONNECTORS
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                {'>'} Adding a data source requires creating only one connector file.
              </p>
            </div>
          </Reveal>
          <div className="flex flex-wrap gap-0 border-[3px] border-border">
            {connectorsData.connectors.map((c, i) => (
              <Reveal key={c.id} delay={(i % 8) * 0.03}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wide border-r-[3px] border-b-[3px] border-border hover:bg-accent hover:text-background transition-colors"
                  title={c.description}
                >
                  <Lock className="h-3 w-3" strokeWidth={2.5} />
                  {c.name}
                </span>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Trust signals */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 border-b-[3px] border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 border-[3px] border-border">
          {[
            { icon: Lock, title: 'NO_PRIVATE_DATA', desc: 'Only public APIs. Never authenticates as you.' },
            { icon: Shield, title: 'RATE_LIMITED', desc: 'Smart caching & retry to respect upstreams.' },
            { icon: CheckCircle2, title: 'OPEN_ARCHITECTURE', desc: 'Add a connector in one file.' },
          ].map((t, i) => (
            <div
              key={t.title}
              className="flex items-start gap-3 p-5 border-r-[3px] last:border-r-0 border-border"
              style={{ borderRightWidth: i < 2 ? 3 : 0 }}
            >
              <t.icon className="h-5 w-5 shrink-0 mt-0.5 text-accent" strokeWidth={2} />
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wide">{t.title}</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16">
        <Reveal>
          <div className="border-[3px] border-border p-10 sm:p-14 text-center relative overflow-hidden">
            <BgText className="top-0 left-1/2 -translate-x-1/2">EXECUTE</BgText>
            <div className="relative">
              <Terminal className="h-10 w-10 mx-auto mb-4 text-accent" strokeWidth={2} />
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
                READY TO SCAN?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 font-mono text-sm leading-relaxed">
                {'>'} No signup. No data stored beyond local history. Just enter a
                username, GitHub handle, website, or email.
              </p>
              <Button
                size="lg"
                onClick={() => setView('scanner')}
                className="h-14 px-9 text-sm border-[3px] border-accent bg-accent text-background hover:bg-background hover:text-accent font-mono font-bold uppercase tracking-wider"
              >
                <Zap className="h-4 w-4 mr-2" strokeWidth={2.5} />
                RUN_FIRST_SCAN
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}

/* ----------------------------- Animated Terminal Preview ----------------------------- */

const SCAN_LINES = [
  { delay: 600, text: 'TARGET: ratnesh', color: 'text-accent' },
  { delay: 1000, text: 'GITHUB: FOUND', color: 'text-accent font-bold' },
  { delay: 1400, text: 'CODEFORCES: FOUND', color: 'text-accent font-bold' },
  { delay: 1800, text: 'DEV.TO: NOT_FOUND', color: 'text-muted-foreground' },
  { delay: 2200, text: 'PORTFOLIO: WEAK_SIGNAL', color: 'text-[var(--chart-3)]' },
  { delay: 2600, text: 'NPM: 3 PKGS', color: 'text-accent font-bold' },
  { delay: 3000, text: 'SCORE: 78/100', color: 'text-accent font-bold' },
]

function AnimatedTerminalPreview() {
  const [visibleLines, setVisibleLines] = React.useState(0)
  const [scoreRevealed, setScoreRevealed] = React.useState(false)

  React.useEffect(() => {
    const timers = SCAN_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    )
    const scoreTimer = setTimeout(() => setScoreRevealed(true), 3400)
    return () => { timers.forEach(clearTimeout); clearTimeout(scoreTimer) }
  }, [])

  return (
    <div className="relative bg-card border-[4px] border-border shadow-brutal-lg">
      {/* Header strip */}
      <div className="flex items-center justify-between bg-foreground text-background px-3 py-1.5 border-b-[3px] border-border">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 bg-accent animate-pulse" />
          IDENTITYSCOPE_AI
        </span>
        <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-accent text-background px-1.5 py-0.5">
          LIVE
        </span>
      </div>

      <div className="p-4 font-mono text-xs">
        {/* ASCII top border */}
        <div className="text-muted-foreground/40">{'┌─────────────────────────────┐'}</div>

        {/* Scan lines — reveal sequentially */}
        <div className="min-h-[180px]">
          {SCAN_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="flex"
            >
              <span className="text-muted-foreground/40">│ </span>
              <span className={line.color}>{line.text}</span>
            </motion.div>
          ))}

          {/* Blinking cursor while scanning */}
          {visibleLines < SCAN_LINES.length && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-muted-foreground/40">│ </span>
              <span className="cursor-blink" />
              <span className="text-muted-foreground">scanning_</span>
            </div>
          )}

          {/* ASCII bottom border + score meter */}
          {scoreRevealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-muted-foreground/40">{'└─────────────────────────────┘'}</div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">REPUTATION_SCORE</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-accent tracking-tight">
                    [{'█'.repeat(16)}{'░'.repeat(8)}]
                  </span>
                  <span className="text-accent font-bold tabular-nums">78/100</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
