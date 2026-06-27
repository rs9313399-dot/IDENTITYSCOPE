'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanSearch,
  Github,
  Globe,
  Mail,
  AtSign,
  Sparkles,
  Loader2,
  History,
  Shield,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useScan, useHistory } from '@/hooks/use-scan'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/charts/animated'
import type { QueryType } from '@/lib/types'

type Mode = 'auto' | 'github' | 'website' | 'email'

const EXAMPLES = [
  { label: 'torvalds', type: 'github' as Mode, hint: 'GitHub' },
  { label: 'vercel.com', type: 'website' as Mode, hint: 'Website' },
  { label: 'sindresorhus', type: 'github' as Mode, hint: 'GitHub' },
  { label: 'gaearon', type: 'github' as Mode, hint: 'GitHub' },
]

export function ScannerView() {
  const [mode, setMode] = React.useState<Mode>('auto')
  const [query, setQuery] = React.useState('')
  const [github, setGithub] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [website, setWebsite] = React.useState('')
  const scan = useScan()
  const { data: historyData } = useHistory()
  const setView = useAppStore((s) => s.setView)
  const setLastInput = useAppStore((s) => s.setLastInput)

  const detected: QueryType = React.useMemo(() => {
    const v = query.trim().toLowerCase()
    if (!v) return 'username'
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email'
    if (/^https?:\/\//i.test(v) || /^[\w-]+\.[a-z]{2,}(\/|$)/i.test(v)) return 'website'
    return 'username'
  }, [query])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const input = {
      query: query.trim(),
      type: detected,
      github: github.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
    }
    setLastInput(input)
    scan.mutate(input)
  }

  function loadExample(ex: (typeof EXAMPLES)[number]) {
    setQuery(ex.label)
    setMode('auto')
  }

  const placeholder =
    mode === 'github'
      ? 'e.g. torvalds'
      : mode === 'website'
        ? 'e.g. vercel.com'
        : mode === 'email'
          ? 'e.g. you@domain.com'
          : 'username, @github, website.com, or email'

  return (
    <div className="relative">
      <div className="aurora opacity-60" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <Reveal>
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <ScanSearch className="h-3 w-3" /> Identity Scanner
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
              Scan a <span className="gradient-text">digital identity</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Enter a username, GitHub handle, website, or email. Add optional
              signals to enrich the report. All from public APIs.
            </p>
          </div>
        </Reveal>

        {/* Mode tabs */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {([
              { id: 'auto', label: 'Auto-detect', icon: Sparkles },
              { id: 'github', label: 'GitHub', icon: Github },
              { id: 'website', label: 'Website', icon: Globe },
              { id: 'email', label: 'Email', icon: Mail },
            ] as { id: Mode; label: string; icon: React.ElementType }[]).map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === m.id
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : 'glass text-muted-foreground hover:text-foreground'
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.15}>
          <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <Label htmlFor="query" className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Primary query
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {detected === 'email' ? (
                      <Mail className="h-4.5 w-4.5" />
                    ) : detected === 'website' ? (
                      <Globe className="h-4.5 w-4.5" />
                    ) : detected === 'github' ? (
                      <Github className="h-4.5 w-4.5" />
                    ) : (
                      <AtSign className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <Input
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="h-14 pl-11 pr-32 text-base rounded-xl glass"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      type="submit"
                      disabled={!query.trim() || scan.isPending}
                      className="h-10 px-5"
                    >
                      {scan.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-1.5" /> Scan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {query.trim() && (
                  <p className="text-xs text-muted-foreground mt-2 ml-1">
                    Detected: <span className="text-primary font-medium capitalize">{detected}</span>
                  </p>
                )}
              </div>

              {/* Optional enrichment */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Github className="h-3 w-3" /> GitHub (optional)
                  </Label>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="@handle"
                    className="h-11 glass"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Mail className="h-3 w-3" /> Email (optional)
                  </Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="h-11 glass"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                    <Globe className="h-3 w-3" /> Website (optional)
                  </Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="yoursite.com"
                    className="h-11 glass"
                  />
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="mt-6 pt-5 border-t border-border/40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Try:</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => loadExample(ex)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md glass hover:bg-accent transition-colors"
                  >
                    <span className="font-mono">{ex.label}</span>
                    <span className="text-muted-foreground">· {ex.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Only public APIs are called. No accounts are accessed. Results cached locally.
            </div>
          </form>
        </Reveal>

        {/* Scanning overlay */}
        <AnimatePresence>
          {scan.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <div className="glass-strong rounded-3xl p-10 max-w-md w-full mx-4 text-center">
                <div className="relative mx-auto h-16 w-16 mb-5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanSearch className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">Scanning digital identity…</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Querying public APIs for{' '}
                  <span className="font-mono text-foreground">{query}</span>
                </p>
                <div className="space-y-1.5 text-left">
                  {[
                    'GitHub profile & repositories',
                    'Social discovery across 7 platforms',
                    'Package registries (NPM, PyPI)',
                    'Codeforces competitive profile',
                    'Website & portfolio analysis',
                    'Email validation',
                    'Computing 10-dimension scores',
                  ].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.18 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-muted-foreground">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent scans */}
        {historyData && historyData.scans.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  Recent scans
                </h3>
                <button
                  onClick={() => setView('history')}
                  className="text-xs text-primary hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {historyData.scans.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setView('history')}
                    className="glass rounded-lg px-3 py-1.5 text-xs hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <span className="font-mono">{s.query}</span>
                    {s.overallScore != null && (
                      <Badge variant="secondary" className="py-0 px-1.5 text-[10px]">
                        {s.overallScore}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}
