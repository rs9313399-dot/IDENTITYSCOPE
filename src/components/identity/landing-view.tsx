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
  { icon: Users, title: 'Social Discovery', desc: 'Probe 7+ platforms for the same handle — Reddit, Dev.to, Hashnode, Medium, Kaggle, Stack Overflow.' },
  { icon: Brain, title: 'AI Report', desc: 'Gemini-powered executive summary, career suggestions, learning roadmap, resume & portfolio tips.' },
  { icon: GitCompareArrows, title: 'Compare Mode', desc: 'Side-by-side comparison of two developers across followers, stars, languages & scores.' },
  { icon: BarChart3, title: 'Premium Visualizations', desc: 'Radar, pie, bar charts, animated counters, progress rings, contribution calendar.' },
  { icon: FileDown, title: 'PDF Export & Sharing', desc: 'Print-ready reports with scores, charts and recommendations — shareable in one click.' },
]

const STATS = [
  { value: 12, suffix: '+', label: 'Public APIs' },
  { value: 7, suffix: '+', label: 'Social platforms' },
  { value: 10, suffix: '', label: 'Scoring dimensions' },
  { value: 100, suffix: '%', label: 'Privacy-first' },
]

const SCORE_DIMENSIONS = [
  'Developer', 'Portfolio', 'Open Source', 'Repository', 'Documentation',
  'Consistency', 'Security', 'Community', 'Brand', 'Overall',
]

export function LandingView() {
  const setView = useAppStore((s) => s.setView)
  const { data: connectorsData } = useConnectors()

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="aurora" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 py-1.5 px-3">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs">Powered by public APIs · No auth bypassed · Privacy-first</span>
            </Badge>
            <h1 className="text-balance text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Discover your{' '}
              <span className="gradient-text">digital identity</span>{' '}
              across the internet.
            </h1>
            <p className="mt-6 text-balance text-base sm:text-lg text-muted-foreground max-w-2xl">
              IdentityScope AI scans a username, GitHub profile, website, or email and
              generates a complete Digital Identity Report — GitHub analysis, portfolio
              scoring, social discovery, and AI recommendations.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => setView('scanner')}
                className="h-12 px-7 text-base glow-primary group"
              >
                <ScanSearch className="h-4.5 w-4.5 mr-2" />
                Start a Scan
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView('about')}
                className="h-12 px-7 text-base"
              >
                How it works
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.08}>
                  <div className="glass rounded-2xl p-5 text-center">
                    <div className="text-3xl sm:text-4xl font-bold gradient-text tabular-nums">
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Input types preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Github, label: 'GitHub Profile', hint: '@username', color: 'oklch(0.72 0.19 265)' },
              { icon: Globe, label: 'Website URL', hint: 'yoursite.com', color: 'oklch(0.7 0.25 305)' },
              { icon: Mail, label: 'Email', hint: 'you@domain.com', color: 'oklch(0.76 0.17 165)' },
              { icon: ScanSearch, label: 'Username', hint: 'cross-platform', color: 'oklch(0.78 0.17 85)' },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06}>
                <button
                  onClick={() => setView('scanner')}
                  className="group w-full glass rounded-2xl p-5 text-left hover:glow transition-all hover:-translate-y-1"
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${c.color}22`, color: c.color }}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold text-sm">{c.label}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{c.hint}</div>
                </button>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <Reveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything in one <span className="gradient-text">identity report</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              A premium SaaS dashboard for understanding how you show up across the public internet.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.06}>
              <div className="group h-full glass rounded-2xl p-5 hover:glow transition-all hover:-translate-y-1">
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Score dimensions */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <Reveal>
          <div className="glass-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-30" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <Badge variant="outline" className="mb-3">Scoring system</Badge>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  10 dimensions. One overall score.
                </h2>
                <p className="text-muted-foreground mb-6">
                  Every report is scored across developer, portfolio, open-source,
                  documentation, consistency, security, community and brand — each
                  computed from real public signals.
                </p>
                <Button onClick={() => setView('scanner')} className="glow-primary">
                  Try it now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {SCORE_DIMENSIONS.map((d, i) => (
                  <motion.div
                    key={d}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl px-4 py-3 flex items-center gap-2.5"
                  >
                    <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                    <span className="text-sm font-medium">{d}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Connectors */}
      {connectorsData && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Reveal>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-3">Public API connectors</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Modular architecture. {connectorsData.connectors.length} connectors.
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Adding a new data source requires creating only one connector file.
              </p>
            </div>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-2">
            {connectorsData.connectors.map((c, i) => (
              <Reveal key={c.id} delay={(i % 6) * 0.04}>
                <Badge variant="secondary" className="py-1.5 px-3 gap-1.5" title={c.description}>
                  <Lock className="h-3 w-3 text-emerald-500" />
                  {c.name}
                </Badge>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-[oklch(0.7_0.25_305/0.15)] to-[oklch(0.76_0.17_165/0.15)] border border-border/40 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Ready to see your digital identity?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-7">
                No signup. No data stored beyond your local history. Just enter a
                username, GitHub handle, website, or email.
              </p>
              <Button size="lg" onClick={() => setView('scanner')} className="glow-primary h-12 px-8 text-base">
                <Zap className="h-4 w-4 mr-2" />
                Run your first scan
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
