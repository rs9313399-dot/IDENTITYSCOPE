'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Info,
  Shield,
  Github,
  Globe,
  Mail,
  Users,
  Brain,
  Lock,
  Code2,
  Zap,
  Heart,
  ExternalLink,
  ScanSearch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { useConnectors } from '@/hooks/use-scan'
import { Reveal } from '@/components/charts/animated'

const PRINCIPLES = [
  { icon: Shield, title: 'Privacy-first', desc: 'Only public APIs. No auth bypassed, no private data scraped.' },
  { icon: Lock, title: 'No secrets exposed', desc: 'No API keys shipped to the client. All upstream calls happen server-side.' },
  { icon: Code2, title: 'Modular architecture', desc: 'Each connector is one file. Add a new data source in minutes.' },
  { icon: Brain, title: 'AI-enhanced', desc: 'Gemini generates a professional report from the public-data summary.' },
]

const API_LIST = [
  { name: 'GitHub REST API', url: 'https://docs.github.com/rest', auth: false },
  { name: 'Codeforces API', url: 'https://codeforces.com/apiHelp', auth: false },
  { name: 'NPM Registry', url: 'https://github.com/npm/registry', auth: false },
  { name: 'PyPI JSON API', url: 'https://warehouse.pypa.io/api-reference/json.html', auth: false },
  { name: 'Reddit about.json', url: 'https://www.reddit.com/dev/api', auth: false },
  { name: 'Dev.to API', url: 'https://developers.forem.com/api', auth: false },
  { name: 'Hashnode GraphQL', url: 'https://gql.hashnode.com', auth: false },
  { name: 'Stack Exchange API', url: 'https://api.stackexchange.com', auth: false },
  { name: 'Cloudflare DNS-over-HTTPS', url: 'https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https', auth: false },
  { name: 'Medium (public profile)', url: 'https://medium.com', auth: false },
  { name: 'Kaggle (public profile)', url: 'https://www.kaggle.com', auth: false },
  { name: 'z-ai-web-dev-sdk (Gemini)', url: 'https://z.ai', auth: false },
]

export function AboutView() {
  const setView = useAppStore((s) => s.setView)
  const { data: connectorsData } = useConnectors()

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Hero */}
      <Reveal>
        <Card className="glass-strong p-8 sm:p-12 relative overflow-hidden mb-8">
          <div className="absolute inset-0 aurora opacity-50" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.7_0.25_305)] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ScanSearch className="h-7 w-7 text-white" />
            </div>
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Info className="h-3 w-3" /> About
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              IdentityScope <span className="gradient-text">AI</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Discover your digital identity across the internet. A privacy-first SaaS that
              scans a username, GitHub profile, website, or email and generates a complete
              Digital Identity Report — powered exclusively by public APIs.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => setView('scanner')}>
                <ScanSearch className="h-4 w-4 mr-1.5" /> Try it now
              </Button>
              <Button variant="outline" onClick={() => setView('landing')}>
                Back to home
              </Button>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Principles */}
      <Reveal delay={0.05}>
        <h2 className="text-xl font-bold mb-4 text-center">Core principles</h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <Card className="glass p-5 h-full">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* How it works */}
      <Reveal delay={0.1}>
        <Card className="glass p-6 mb-8">
          <h2 className="text-xl font-bold mb-5">How it works</h2>
          <div className="space-y-4">
            {[
              { icon: ScanSearch, title: '1 · You submit a query', desc: 'A username, GitHub handle, website URL, or email — plus optional enrichment fields.' },
              { icon: Zap, title: '2 · Connectors run in parallel', desc: 'Each public-API connector (GitHub, Codeforces, NPM, PyPI, Reddit, Dev.to, Hashnode, Medium, Kaggle, Stack Overflow, Website, Email) executes with retry, timeout, caching and rate-limit handling.' },
              { icon: Code2, title: '3 · Scoring engine aggregates signals', desc: '10 dimensions (developer, portfolio, open source, repository, documentation, consistency, security, community, brand, overall) are computed from real public data.' },
              { icon: Brain, title: '4 · AI generates a professional report', desc: 'Gemini summarizes the public-data report into an executive summary, strengths, weaknesses, career suggestions and a learning roadmap.' },
              { icon: Shield, title: '5 · You explore, compare and export', desc: 'Browse the dashboard, compare two identities side by side, bookmark reports, and export to PDF — all from public data only.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-4"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <step.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* Public APIs used */}
      <Reveal delay={0.15}>
        <Card className="glass p-6 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold">Public APIs used</h2>
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              {connectorsData?.connectors.length ?? API_LIST.length} connectors
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {API_LIST.map((api) => (
              <a
                key={api.name}
                href={api.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-2 glass rounded-lg px-3 py-2.5 hover:bg-accent/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-sm truncate">{api.name}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
              </a>
            ))}
          </div>
        </Card>
      </Reveal>

      {/* Privacy commitment */}
      <Reveal delay={0.2}>
        <Card className="glass-strong p-6 mb-8 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold mb-2">Privacy commitment</h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• Only publicly available information is analyzed.</li>
                <li>• No authentication is ever bypassed. We never log in as anyone.</li>
                <li>• No private accounts, DMs, or sensitive data are accessed.</li>
                <li>• No third-party tracking APIs are called. Email validation uses only DNS-over-HTTPS (which sees the domain, not the full email).</li>
                <li>• Scan history is stored locally in your browser's database; nothing is sent to a remote server.</li>
                <li>• All upstream API calls happen server-side; no API keys are ever shipped to the client.</li>
              </ul>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Footer credit */}
      <Reveal delay={0.25}>
        <div className="text-center text-xs text-muted-foreground">
          Built with <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> using Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, Prisma and z-ai-web-dev-sdk.
          <div className="mt-1">
            Public APIs sourced from the{' '}
            <a
              href="https://github.com/public-apis/public-apis"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              public-apis repository
            </a>
            .
          </div>
        </div>
      </Reveal>
    </div>
  )
}
