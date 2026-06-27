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
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useScanStream, useHistory } from '@/hooks/use-scan'
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
  const scan = useScanStream()
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
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <Reveal>
          <div className="mb-10">
            <span className="label-brutal">{"// "}Scanner</span>
            <h1 className="text-4xl sm:text-6xl font-bold uppercase tracking-tight mt-2">
              Scan a <span className="text-accent">digital identity</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-sm sm:text-base leading-relaxed">
              Enter a username, GitHub handle, website, or email. Add optional
              signals to enrich the report. All from public APIs.
            </p>
          </div>
        </Reveal>

        {/* Mode tabs — brutalist, blocky */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-0 mb-0 border-[3px] border-border border-b-0">
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
                  'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-r-[3px] border-border last:border-r-0',
                  mode === m.id
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-secondary'
                )}
              >
                <m.icon className="h-3.5 w-3.5" strokeWidth={2} />
                {m.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Form — brutalist, thick borders */}
        <Reveal delay={0.15}>
          <form onSubmit={onSubmit} className="glass-strong p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <Label htmlFor="query" className="label-brutal mb-2 block">
                  Primary query
                </Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {detected === 'email' ? (
                      <Mail className="h-4.5 w-4.5" strokeWidth={2} />
                    ) : detected === 'website' ? (
                      <Globe className="h-4.5 w-4.5" strokeWidth={2} />
                    ) : detected === 'github' ? (
                      <Github className="h-4.5 w-4.5" strokeWidth={2} />
                    ) : (
                      <AtSign className="h-4.5 w-4.5" strokeWidth={2} />
                    )}
                  </div>
                  <Input
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder.toUpperCase()}
                    autoComplete="off"
                    className="h-14 pl-11 pr-32 text-base font-mono uppercase tracking-wide border-[3px] border-border focus:border-accent"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      type="submit"
                      disabled={!query.trim() || scan.isPending}
                      className="h-10 px-5 border-[3px] border-border bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider"
                    >
                      {scan.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-1.5" strokeWidth={2.5} /> Scan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {query.trim() && (
                  <p className="text-xs font-mono text-muted-foreground mt-2 ml-1 uppercase tracking-wider">
                    Detected: <span className="text-accent font-bold">{detected}</span>
                  </p>
                )}
              </div>

              {/* Optional enrichment */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="label-brutal flex items-center gap-1.5 mb-1.5">
                    <Github className="h-3 w-3" strokeWidth={2} /> GitHub (opt)
                  </Label>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="@HANDLE"
                    className="h-11 font-mono uppercase border-2 border-border"
                  />
                </div>
                <div>
                  <Label className="label-brutal flex items-center gap-1.5 mb-1.5">
                    <Mail className="h-3 w-3" strokeWidth={2} /> Email (opt)
                  </Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOU@DOMAIN.COM"
                    className="h-11 font-mono uppercase border-2 border-border"
                  />
                </div>
                <div>
                  <Label className="label-brutal flex items-center gap-1.5 mb-1.5">
                    <Globe className="h-3 w-3" strokeWidth={2} /> Website (opt)
                  </Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="YOURSITE.COM"
                    className="h-11 font-mono uppercase border-2 border-border"
                  />
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="mt-6 pt-5 border-t-[3px] border-border">
              <div className="flex flex-wrap items-center gap-0">
                <span className="label-brutal mr-3">Try:</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => loadExample(ex)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase px-2.5 py-1.5 border-2 border-border border-r-0 last:border-r hover:bg-foreground hover:text-background transition-colors"
                  >
                    {ex.label}
                    <span className="opacity-50">· {ex.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
              Only public APIs · No accounts accessed · Results cached locally
            </div>
          </form>
        </Reveal>

        {/* Scanning overlay with real-time connector progress */}
        <AnimatePresence>
          {scan.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong p-6 max-w-md w-full"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 shrink-0 border-[3px] border-border bg-accent flex items-center justify-center">
                    <ScanSearch className="h-5 w-5 text-accent-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm uppercase tracking-wide">Scanning…</h3>
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      QUERY: <span className="text-foreground">{query}</span>
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {scan.activeConnectors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      <span>{scan.progress.length} / {scan.activeConnectors.length} CONNECTORS</span>
                      <span className="tabular-nums text-accent">{Math.round((scan.progress.length / scan.activeConnectors.length) * 100)}%</span>
                    </div>
                    <div className="h-2 border-2 border-border overflow-hidden">
                      <motion.div
                        animate={{
                          width: `${(scan.progress.length / scan.activeConnectors.length) * 100}%`,
                        }}
                        transition={{ duration: 0.2 }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Connector list */}
                <div className="space-y-0 max-h-64 overflow-y-auto scrollbar-thin border-2 border-border">
                  {scan.activeConnectors.map((name) => {
                    const evt = scan.progress.find((p) => p.name === name)
                    const isDone = !!evt
                    const isError = evt?.status === 'error'
                    const isFound = evt?.status === 'found'
                    const isNotFound = evt?.status === 'not_found'
                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: isDone ? 1 : 0.4 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2.5 text-xs py-2 px-3 border-b-2 border-border last:border-b-0 hover:bg-secondary"
                      >
                        {isDone ? (
                          isFound ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                          ) : isError ? (
                            <XCircle className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2.5} />
                          ) : isNotFound ? (
                            <MinusCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2.5} />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2.5} />
                          )
                        ) : (
                          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" strokeWidth={2.5} />
                        )}
                        <span className={isDone ? 'font-bold uppercase tracking-wide' : 'text-muted-foreground uppercase tracking-wide'}>
                          {name}
                        </span>
                        {isFound && (
                          <span className="text-[9px] font-mono font-bold uppercase ml-auto border-2 border-border px-1.5 py-0">
                            FOUND
                          </span>
                        )}
                        {isNotFound && (
                          <span className="text-[9px] font-mono font-bold uppercase ml-auto text-muted-foreground">NOT FOUND</span>
                        )}
                        {isError && evt?.error && (
                          <span className="text-[9px] font-mono font-bold uppercase ml-auto text-accent">ERROR</span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t-[3px] border-border flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                  <Shield className="h-3 w-3" strokeWidth={2.5} />
                  Only public APIs · No private data accessed
                </div>
              </motion.div>
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
