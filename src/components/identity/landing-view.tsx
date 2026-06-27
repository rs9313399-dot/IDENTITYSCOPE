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
  Sparkles,
  ArrowRight,
  BarChart3,
  Users,
  Star,
  Code2,
  Activity,
  Eye,
  BookOpen,
  Package,
  Trophy,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { useConnectors } from '@/hooks/use-scan'
import { Reveal, AnimatedCounter } from '@/components/charts/animated'

const FEATURES = [
  { icon: Github, title: 'GitHub Deep Analysis', desc: 'Repos, languages, contribution heatmap, README quality, repo health scoring, best/worst projects.' },
  { icon: Globe, title: 'Portfolio Scanner', desc: 'Performance, SEO, accessibility, security headers, tech stack fingerprint from public HTTP.' },
  { icon: Mail, title: 'Email Validation', desc: 'Format, disposable domain detection, MX record verification via DNS-over-HTTPS.' },
  { icon: Users, title: 'Social Discovery', desc: 'Probe 9+ platforms — GitHub, Reddit, Dev.to, Hashnode, Medium, Kaggle, Stack Overflow, HN, GitLab.' },
  { icon: Brain, title: 'AI Report', desc: 'Gemini-powered executive summary, career suggestions, learning roadmap, resume & portfolio tips.' },
  { icon: GitCompareArrows, title: 'Compare Mode', desc: 'Side-by-side comparison of two developers across followers, stars, languages & scores.' },
  { icon: BarChart3, title: 'Premium Visualizations', desc: 'Radar, pie, bar charts, animated counters, progress rings, contribution calendar.' },
  { icon: FileDown, title: 'PDF Export & Sharing', desc: 'Print-ready reports with scores, charts and recommendations — shareable in one click.' },
]

const STATS = [
  { value: 15, suffix: '+', label: 'Public APIs', icon: Code2 },
  { value: 9, suffix: '+', label: 'Social platforms', icon: Users },
  { value: 10, suffix: '', label: 'Scoring dimensions', icon: BarChart3 },
  { value: 100, suffix: '%', label: 'Privacy-first', icon: Shield },
]

const SCORE_DIMENSIONS = [
  'Developer', 'Portfolio', 'Open Source', 'Repository', 'Documentation',
  'Consistency', 'Security', 'Community', 'Brand', 'Overall',
]

const HOW_IT_WORKS = [
  { step: '01', icon: ScanSearch, title: 'Enter a query', desc: 'Username, GitHub handle, website URL, or email.' },
  { step: '02', icon: Zap, title: 'Connectors run', desc: '15+ public APIs queried with retry, caching & rate-limit handling.' },
  { step: '03', icon: BarChart3, title: 'Scores computed', desc: '10-dimension scoring from real public signals.' },
  { step: '04', icon: Brain, title: 'AI generates insights', desc: 'Gemini summarizes into an actionable report.' },
]

export function LandingView() {
  const setView = useAppStore((s) => s.setView)
  const { data: connectorsData } = useConnectors()

  return (
    <div className="relative">
      {/* Hero — massive typography, editorial */}
      <section className="relative border-b-[3px] border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 py-20 sm:py-28">
          {/* Top label row */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-10"
          >
            <span className="inline-flex items-center gap-2 border-2 border-border px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest">
              <Lock className="h-3 w-3" strokeWidth={2.5} />
              Powered by public APIs
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              No auth bypassed · Privacy-first
            </span>
          </motion.div>

          {/* Huge headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[3rem] sm:text-[5rem] lg:text-[7rem] font-bold uppercase tracking-tight leading-[0.85] max-w-5xl"
          >
            Discover your{' '}
            <span className="text-accent">digital identity</span>{' '}
            across the internet.
          </motion.h1>

          {/* Description — editorial, constrained */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            Scan a username, GitHub profile, website, or email. Get a complete
            Digital Identity Report — GitHub analysis, portfolio scoring, social
            discovery, and AI recommendations.
          </motion.p>

          {/* CTAs — massive, brutalist */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              onClick={() => setView('scanner')}
              className="h-14 px-8 text-base border-[3px] border-border bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider group"
            >
              <ScanSearch className="h-5 w-5 mr-2.5" strokeWidth={2.5} />
              Start a Scan
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setView('about')}
              className="h-14 px-8 text-base border-[3px] border-border bg-background text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider"
            >
              <Eye className="h-4 w-4 mr-2" strokeWidth={2.5} />
              How it works
            </Button>
          </motion.div>

          {/* Stats — editorial grid, visible borders */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 border-[3px] border-border">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={0.6 + i * 0.08}>
                <div
                  className="p-6 border-r-[3px] border-border last:border-r-0 sm:border-b-0 border-b-[3px] sm:border-b-0"
                  style={{ borderRightWidth: i < STATS.length - 1 ? 3 : 0 }}
                >
                  <s.icon className="h-5 w-5 mb-3" strokeWidth={2} />
                  <div className="text-4xl sm:text-5xl font-bold tabular-nums">
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

      {/* Input types — editorial grid */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16 border-b-[3px] border-border">
        <Reveal>
          <div className="mb-8">
            <span className="label-brutal">{"// "}01 — Input</span>
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-2">
              Scan anything
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-border">
          {[
            { icon: Github, label: 'GitHub Profile', hint: '@username', color: 'var(--accent)', example: 'torvalds' },
            { icon: Globe, label: 'Website URL', hint: 'yoursite.com', color: 'var(--accent)', example: 'vercel.com' },
            { icon: Mail, label: 'Email', hint: 'you@domain.com', color: 'var(--accent)', example: 'validate' },
            { icon: ScanSearch, label: 'Username', hint: 'cross-platform', color: 'var(--accent)', example: 'sindresorhus' },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <button
                onClick={() => setView('scanner')}
                className="group w-full p-6 text-left border-r-[3px] border-b-[3px] sm:border-b-0 last:border-r-0 lg:border-b-0 border-border hover:bg-foreground hover:text-background transition-colors"
                style={{ borderRightWidth: i < 3 ? 3 : 0 }}
              >
                <c.icon className="h-7 w-7 mb-4" strokeWidth={2} />
                <div className="font-bold text-sm uppercase tracking-wide">{c.label}</div>
                <div className="text-xs font-mono mt-1 opacity-60">{c.hint}</div>
                <div className="text-[10px] font-mono mt-3 opacity-0 group-hover:opacity-60 transition-opacity">
                  TRY: {c.example}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16 border-b-[3px] border-border">
        <Reveal>
          <div className="mb-8">
            <span className="label-brutal">{"// "}02 — Process</span>
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-2">
              Four steps to clarity
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-border">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div
                className="relative p-6 border-r-[3px] border-b-[3px] sm:border-b-0 last:border-r-0 lg:border-b-0 border-border group hover:bg-secondary transition-colors"
                style={{ borderRightWidth: i < 3 ? 3 : 0 }}
              >
                <div className="text-6xl font-bold text-border absolute top-2 right-3 select-none opacity-30">
                  {step.step}
                </div>
                <div className="relative">
                  <step.icon className="h-8 w-8 mb-4" strokeWidth={2} />
                  <h3 className="font-bold uppercase tracking-wide mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16 border-b-[3px] border-border">
        <Reveal>
          <div className="mb-8">
            <span className="label-brutal">{"// "}03 — Features</span>
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-2">
              Everything in one report
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[3px] border-border">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.06}>
              <div
                className="p-6 border-r-[3px] border-b-[3px] sm:border-b-0 last:border-r-0 lg:border-b-0 border-border group hover:bg-foreground hover:text-background transition-colors"
                style={{
                  borderRightWidth: i % 4 !== 3 ? 3 : 0,
                  borderBottomWidth: i < FEATURES.length - 4 ? 3 : 0,
                }}
              >
                <f.icon className="h-7 w-7 mb-4" strokeWidth={2} />
                <h3 className="font-bold uppercase tracking-wide text-sm mb-2">{f.title}</h3>
                <p className="text-xs opacity-70 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Score dimensions */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16 border-b-[3px] border-border">
        <div className="grid lg:grid-cols-2 gap-0 border-[3px] border-border">
          <div className="p-8 sm:p-12 border-r-[3px] border-border">
            <span className="label-brutal">{"// "}04 — Scoring</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mt-2 mb-4">
              10 dimensions. One score.
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Every report is scored across developer, portfolio, open-source,
              documentation, consistency, security, community and brand — each
              computed from real public signals.
            </p>
            <div className="flex flex-col gap-2">
              {[
                { icon: Trophy, label: 'Developer Score', desc: 'Followers, repos, stars, account age' },
                { icon: Activity, label: 'Consistency Score', desc: 'Contribution frequency & streaks' },
                { icon: Shield, label: 'Security Score', desc: 'HTTPS, headers, email health' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 border-2 border-border p-2.5">
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide">{item.label}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setView('scanner')}
              className="mt-6 border-[3px] border-border bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider"
            >
              Try it now <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2.5} />
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
                <span className="text-sm font-bold uppercase tracking-wide">{d}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      {connectorsData && (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16 border-b-[3px] border-border">
          <Reveal>
            <div className="mb-8">
              <span className="label-brutal">{"// "}05 — Connectors</span>
              <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-2">
                {connectorsData.connectors.length} public API connectors
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                Adding a new data source requires creating only one connector file.
              </p>
            </div>
          </Reveal>
          <div className="flex flex-wrap gap-0 border-[3px] border-border">
            {connectorsData.connectors.map((c, i) => (
              <Reveal key={c.id} delay={(i % 8) * 0.03}>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wide border-r-[3px] border-b-[3px] border-border hover:bg-foreground hover:text-background transition-colors"
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
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-12 border-b-[3px] border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 border-[3px] border-border">
          {[
            { icon: Lock, title: 'No private data', desc: 'Only public APIs. Never authenticates as you.' },
            { icon: Shield, title: 'Rate-limited', desc: 'Smart caching & retry to respect upstreams.' },
            { icon: CheckCircle2, title: 'Open architecture', desc: 'Add a connector in one file.' },
          ].map((t, i) => (
            <div
              key={t.title}
              className="flex items-start gap-3 p-5 border-r-[3px] last:border-r-0 border-border"
              style={{ borderRightWidth: i < 2 ? 3 : 0 }}
            >
              <t.icon className="h-5 w-5 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide">{t.title}</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — massive, bold */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 py-20">
        <Reveal>
          <div className="border-[3px] border-border p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid" />
            <div className="relative">
              <Shield className="h-12 w-12 mx-auto mb-5" strokeWidth={2} />
              <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mb-4">
                Ready to see your digital identity?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-balance leading-relaxed">
                No signup. No data stored beyond your local history. Just enter a
                username, GitHub handle, website, or email.
              </p>
              <Button
                size="lg"
                onClick={() => setView('scanner')}
                className="h-14 px-9 text-base border-[3px] border-border bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider"
              >
                <Zap className="h-4 w-4 mr-2" strokeWidth={2.5} />
                Run your first scan
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
