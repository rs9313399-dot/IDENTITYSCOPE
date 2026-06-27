'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanSearch,
  LayoutDashboard,
  Brain,
  GitCompareArrows,
  Bookmark,
  History,
  Settings,
  Info,
  Search,
  CornerDownLeft,
  Zap,
  Github,
  Globe,
  Mail,
  AtSign,
} from 'lucide-react'
import { useAppStore, type View } from '@/stores/app-store'
import { useHistory, loadScanById } from '@/hooks/use-scan'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  desc: string
  icon: React.ElementType
  action: () => void
  group: 'navigate' | 'scan' | 'examples' | 'history'
  keywords?: string
}

const EXAMPLES = [
  { label: 'torvalds', type: 'github', icon: Github },
  { label: 'sindresorhus', type: 'github', icon: Github },
  { label: 'gaearon', type: 'github', icon: Github },
  { label: 'vercel.com', type: 'website', icon: Globe },
  { label: 'dang', type: 'username', icon: AtSign },
]

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { setView, setLastInput } = useAppStore()
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Scan mutation via the store — we just navigate to scanner with the query
  const scan = useAppStore((s) => s.setView)
  const setCurrentReport = useAppStore((s) => s.setCurrentReport)
  const { data: historyData } = useHistory()

  const commands: CommandItem[] = React.useMemo(() => {
    const nav: CommandItem[] = [
      { id: 'nav-scanner', label: 'Scanner', desc: 'Go to the scan form', icon: ScanSearch, action: () => setView('scanner'), group: 'navigate', keywords: 'scan search' },
      { id: 'nav-dashboard', label: 'Dashboard', desc: 'View current report', icon: LayoutDashboard, action: () => setView('dashboard'), group: 'navigate', keywords: 'report scores' },
      { id: 'nav-report', label: 'AI Report', desc: 'View AI identity report', icon: Brain, action: () => setView('report'), group: 'navigate', keywords: 'ai gemini' },
      { id: 'nav-compare', label: 'Compare', desc: 'Compare two identities', icon: GitCompareArrows, action: () => setView('compare'), group: 'navigate', keywords: 'versus vs' },
      { id: 'nav-history', label: 'History', desc: 'Browse past scans', icon: History, action: () => setView('history'), group: 'navigate' },
      { id: 'nav-bookmarks', label: 'Bookmarks', desc: 'Saved reports', icon: Bookmark, action: () => setView('bookmarks'), group: 'navigate' },
      { id: 'nav-settings', label: 'Settings', desc: 'Preferences & accent color', icon: Settings, action: () => setView('settings'), group: 'navigate' },
      { id: 'nav-about', label: 'About', desc: 'About IdentityScope AI', icon: Info, action: () => setView('about'), group: 'navigate' },
    ]

    const examples: CommandItem[] = EXAMPLES.map((ex) => ({
      id: `scan-${ex.label}`,
      label: `Scan ${ex.label}`,
      desc: `Run a scan on "${ex.label}"`,
      icon: ex.icon,
      action: () => {
        const input = {
          query: ex.label,
          type: ex.type === 'github' ? 'github' : ex.type === 'website' ? 'website' : 'username',
        } as const
        setLastInput(input)
        setView('scanner')
        onClose()
      },
      group: 'examples' as const,
      keywords: ex.type,
    }))

    // Recent scan history — open past reports directly
    const history: CommandItem[] = (historyData?.scans ?? []).slice(0, 8).map((s) => ({
      id: `history-${s.id}`,
      label: s.query,
      desc: `Score ${s.overallScore ?? '—'} · ${new Date(s.createdAt).toLocaleDateString()}`,
      icon: History,
      action: async () => {
        const report = await loadScanById(s.id)
        if (report) {
          setCurrentReport(report)
          setView('dashboard')
        }
        onClose()
      },
      group: 'history' as const,
      keywords: s.queryType,
    }))

    return [...nav, ...examples, ...history]
  }, [setView, setLastInput, onClose, historyData, setCurrentReport])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q)
    )
  }, [commands, query])

  // Reset selection when query changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll selected item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) {
        item.action()
        onClose()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // Group filtered items
  const groups = React.useMemo(() => {
    const g: Record<string, CommandItem[]> = { navigate: [], examples: [], history: [] }
    for (const c of filtered) {
      if (!g[c.group]) g[c.group] = []
      g[c.group].push(c)
    }
    return g
  }, [filtered])

  if (!open) return null

  const groupLabels: Record<string, string> = {
    navigate: 'Navigate',
    examples: 'Quick scans',
    history: 'Recent scans',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm no-print p-4"
      >
        <motion.div
          initial={{ scale: 0.97, y: -8 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.97, y: -8 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands or scan a username..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 rounded border border-border/60">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No results for "{query}"
              </div>
            ) : (
              Object.entries(groups).map(([groupKey, items]) =>
                items.length === 0 ? null : (
                  <div key={groupKey} className="mb-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5">
                      {groupLabels[groupKey] ?? groupKey}
                    </div>
                    {items.map((item) => {
                      const idx = filtered.indexOf(item)
                      const selected = idx === selectedIndex
                      return (
                        <button
                          key={item.id}
                          data-idx={idx}
                          onClick={() => {
                            item.action()
                            onClose()
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-colors',
                            selected ? 'bg-accent/60' : 'hover:bg-accent/30'
                          )}
                        >
                          <div
                            className={cn(
                              'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                              selected ? 'bg-primary/20 text-primary' : 'bg-muted/40 text-muted-foreground'
                            )}
                          >
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.label}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{item.desc}</div>
                          </div>
                          {selected && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              )
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono px-1 py-0.5 rounded border border-border/60">↵</kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              {filtered.length} results
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
