'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ScanSearch,
  LayoutDashboard,
  FileText,
  GitCompareArrows,
  Bookmark,
  History,
  Settings,
  Info,
  Github,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { useAppStore, type View } from '@/stores/app-store'
import { cn } from '@/lib/utils'

const NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'scanner', label: 'SCAN', icon: ScanSearch },
  { id: 'dashboard', label: 'DOSSIER', icon: LayoutDashboard },
  { id: 'report', label: 'AI_VERDICT', icon: FileText },
  { id: 'compare', label: 'VS', icon: GitCompareArrows },
  { id: 'bookmarks', label: 'SAVED', icon: Bookmark },
  { id: 'history', label: 'ARCHIVE', icon: History },
  { id: 'about', label: 'INFO', icon: Info },
]

export function Header() {
  const { view, setView } = useAppStore()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 w-full no-print border-b-[3px] border-border bg-background">
      {/* Top status strip — terminal metadata */}
      <div className="border-b border-border/40 bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-1 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent animate-pulse" />
            SYSTEM_ONLINE
          </span>
          <span className="hidden sm:inline">PUBLIC_API_MODE · NO_AUTH_BYPASS · v1.0.0</span>
          <span>IDENTITY_TRACE_ACTIVE</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo — terminal-style */}
          <button
            onClick={() => setView('landing')}
            className="group flex items-center gap-2.5 shrink-0"
            aria-label="IdentityScope AI home"
          >
            <div className="h-9 w-9 border-[3px] border-accent bg-accent flex items-center justify-center">
              <ScanSearch className="h-5 w-5 text-background" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-black tracking-tight uppercase font-mono">
                IDENTITYSCOPE
              </span>
              <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest">
                {"// "}AI_SCANNER
              </span>
            </div>
          </button>

          {/* Desktop nav — monospace, active = green block */}
          <nav className="hidden lg:flex items-center gap-0">
            {NAV.map((item) => {
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    'px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors border-r border-border/30 last:border-r-0',
                    active
                      ? 'bg-accent text-background'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex h-9 w-9 items-center justify-center border-2 border-border hover:bg-accent hover:text-background hover:border-accent transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" strokeWidth={2} />
            </a>
            <button
              onClick={() => setView('scanner')}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 border-2 border-accent bg-accent text-background hover:bg-background hover:text-accent font-mono font-bold uppercase tracking-wider text-xs transition-colors"
            >
              <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
              START_SCAN
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center border-2 border-border"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="lg:hidden border-t-[3px] border-border overflow-hidden bg-background"
        >
          <nav className="px-4 py-0 grid grid-cols-2 gap-0">
            {NAV.map((item) => {
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-3 text-[11px] font-mono font-bold uppercase tracking-wider border-b-2 border-r-2 border-border transition-colors',
                    active
                      ? 'bg-accent text-background'
                      : 'hover:bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </button>
              )
            })}
            <button
              onClick={() => {
                setView('settings')
                setMobileOpen(false)
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-3 text-[11px] font-mono font-bold uppercase tracking-wider border-b-2 border-border transition-colors',
                view === 'settings'
                  ? 'bg-accent text-background'
                  : 'hover:bg-secondary'
              )}
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
              CONFIG
            </button>
          </nav>
        </motion.div>
      )}
    </header>
  )
}

export function Footer() {
  const setView = useAppStore((s) => s.setView)
  return (
    <footer className="mt-auto border-t-[3px] border-border bg-background no-print">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
        <div className="font-mono text-xs space-y-2">
          <div className="font-black uppercase tracking-tight">IDENTITYSCOPE_AI</div>
          <div className="text-muted-foreground">PUBLIC API BASED IDENTITY ANALYSIS TOOL</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-muted-foreground pt-2 border-t border-border/40">
            <span>BUILD: v1.0.0</span>
            <span>MODE: PUBLIC_DATA_ONLY</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 bg-accent" />
              STATUS: ONLINE
            </span>
            <button onClick={() => setView('about')} className="hover:text-accent transition-colors ml-auto">
              [ABOUT]
            </button>
            <button onClick={() => setView('scanner')} className="hover:text-accent transition-colors">
              [SCAN]
            </button>
            <a
              href="https://github.com/public-apis/public-apis"
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent transition-colors"
            >
              [PUBLIC_APIS]
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
