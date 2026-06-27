'use client'

import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  { value: 14, suffix: '+', label: 'Public APIs', icon: Code2 },
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
  { step: '02', icon: Zap, title: 'Connectors run', desc: '14+ public APIs queried with retry, caching & rate-limit handling.' },
  { step: '03', icon: BarChart3, title: 'Scores computed', desc: '10-dimension scoring from real public signals.' },
  { step: '04', icon: Brain, title: 'AI generates insights', desc: 'Gemini summarizes into an actionable report.' },
]

// Animated floating orbs for hero depth
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, oklch(0.72 0.19 265) 0%, transparent 70%)',
          top: '-10%', left: '-5%',
        }}
        animate={{ y: [0, 20, -15, 0], x: [0, -10, 8, 0], scale: [1, 1.05, 0.97, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, oklch(0.7 0.25 305) 0%, transparent 70%)',
          bottom: '-15%', right: '-5%',
        }}
        animate={{ y: [0, -18, 12, 0], x: [0, 12, -8, 0], scale: [1, 0.96, 1.04, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, oklch(0.76 0.17 165) 0%, transparent 70%)',
          top: '30%', right: '15%',
        }}
        animate={{ y: [0, 10, -8, 0], scale: [1, 1.03, 0.98, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
      />
    </div>
  )
}

// Staggered word-by-word reveal for hero heading
function HeroHeading() {
  const words = ['Discover', 'your', 'digital identity', 'across', 'the', 'internet.']
  return (
    <h1 className="text-balance text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight max-w-4xl leading-[1.1]">
      {words.map((word, i) => {
        const isHighlight = word === 'digital identity'
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.5,
              delay: 0.15 + i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={isHighlight ? 'gradient-text' : ''}
          >
            {word}{' '}
          </motion.span>
        )
      })}
    </h1>
  )
}

export function LandingView() {
  const setView = useAppStore((s) => s.setView)
  const { data: connectorsData } = useConnectors()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3])

  return (
    <div className="relative" ref={containerRef}>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <FloatingOrbs />
        <div className="absolute inset-0 bg-grid opacity-30" />
        {/* Radial vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_75%)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32 w-full"
        >
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <Badge
                variant="secondary"
                className="mb-8 gap-2 py-2 px-4 text-sm font-medium border border-primary/20 bg-primary/5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Powered by public APIs</span>
                <span className="text-muted-foreground">·</span>
                <span>No auth bypassed</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-emerald-500 font-semibold">Privacy-first</span>
              </Badge>
            </motion.div>

            {/* Animated heading */}
            <HeroHeading />

            {/* Subtitle with fade-in */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 text-balance text-lg sm:text-xl text-muted-foreground/90 max-w-2xl leading-relaxed"
            >
              Scan a username, GitHub profile, website, or email and get a
              complete <span className="text-foreground font-medium">Digital Identity Report</span> —
              GitHub analysis, portfolio scoring, social discovery, and AI recommendations.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={() => setView('scanner')}
                className="h-13 px-8 text-base glow-primary group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <ScanSearch className="h-5 w-5 mr-2.5" />
                Start a Scan
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView('about')}
                className="h-13 px-8 text-base border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <Eye className="h-4 w-4 mr-2" />
                How it works
              </Button>
            </motion.div>

            {/* Stats — premium glass cards with glow on hover */}
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={0.9 + i * 0.08}>
                  <div className="group glass rounded-2xl p-6 text-center hover:glow transition-all duration-300 hover:-translate-y-1">
                    <div className="mx-auto mb-3 h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold gradient-text tabular-nums">
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Input types preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold">Scan anything</h2>
            <p className="text-sm text-muted-foreground mt-1">Four input types. One powerful report.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Github, label: 'GitHub Profile', hint: '@username', color: 'oklch(0.72 0.19 265)', example: 'torvalds' },
            { icon: Globe, label: 'Website URL', hint: 'yoursite.com', color: 'oklch(0.7 0.25 305)', example: 'vercel.com' },
            { icon: Mail, label: 'Email', hint: 'you@domain.com', color: 'oklch(0.76 0.17 165)', example: 'validate deliverability' },
            { icon: ScanSearch, label: 'Username', hint: 'cross-platform', color: 'oklch(0.78 0.17 85)', example: 'sindresorhus' },
          ].map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <button
                onClick={() => setView('scanner')}
                className="group w-full glass rounded-2xl p-6 text-left hover:glow transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
                />
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${c.color}18`, color: c.color }}
                >
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-sm">{c.label}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{c.hint}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Try: {c.example}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <Reveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">How it works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Four steps to <span className="gradient-text">full clarity</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div className="relative glass rounded-2xl p-6 text-center group hover:glow transition-all hover:-translate-y-1">
                <div className="text-5xl font-black text-primary/10 absolute top-2 right-4 select-none">{step.step}</div>
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <Reveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything in one <span className="gradient-text">identity report</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              A premium SaaS dashboard for understanding how you show up across the public internet.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.06}>
              <div className="group h-full glass rounded-2xl p-6 hover:glow transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Score dimensions */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <Reveal>
          <div className="glass-strong rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.19_265/0.08),transparent_60%)]" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <Badge variant="outline" className="mb-3">Scoring system</Badge>
                <h2 className="text-3xl font-bold tracking-tight mb-4">
                  10 dimensions. One overall score.
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Every report is scored across developer, portfolio, open-source,
                  documentation, consistency, security, community and brand — each
                  computed from real public signals.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Trophy, label: 'Developer Score', desc: 'Followers, repos, stars, account age' },
                    { icon: Activity, label: 'Consistency Score', desc: 'Contribution frequency & streaks' },
                    { icon: Shield, label: 'Security Score', desc: 'HTTPS, headers, email health' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setView('scanner')} className="glow-primary mt-6">
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
                    transition={{ delay: i * 0.04 }}
                    className="glass rounded-xl px-4 py-3 flex items-center gap-2.5 hover:bg-accent/30 transition-colors"
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
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <Reveal>
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-3">Public API connectors</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Modular architecture. <span className="gradient-text">{connectorsData.connectors.length} connectors</span>.
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Adding a new data source requires creating only one connector file.
              </p>
            </div>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-2">
            {connectorsData.connectors.map((c, i) => (
              <Reveal key={c.id} delay={(i % 6) * 0.04}>
                <Badge
                  variant="secondary"
                  className="py-1.5 px-3.5 gap-1.5 hover:bg-accent/50 transition-colors cursor-default"
                  title={c.description}
                >
                  <Lock className="h-3 w-3 text-emerald-500" />
                  {c.name}
                </Badge>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Trust signals */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'No private data', desc: 'Only public APIs. Never authenticates as you.' },
              { icon: Shield, title: 'Rate-limited', desc: 'Smart caching & retry to respect upstreams.' },
              { icon: CheckCircle2, title: 'Open architecture', desc: 'Add a connector in one file.' },
            ].map((t) => (
              <div key={t.title} className="flex items-start gap-3 glass rounded-xl p-5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <t.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-[oklch(0.7_0.25_305/0.15)] to-[oklch(0.76_0.17_165/0.15)] border border-border/40 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.72_0.19_265/0.1),transparent_60%)]" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Shield className="h-14 w-14 mx-auto text-primary mb-5" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to see your digital identity?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-balance leading-relaxed">
                No signup. No data stored beyond your local history. Just enter a
                username, GitHub handle, website, or email.
              </p>
              <Button
                size="lg"
                onClick={() => setView('scanner')}
                className="glow-primary h-13 px-9 text-base group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
