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
  Moon,
  Sun,
  Github,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore, type View } from '@/stores/app-store'

const NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'scanner', label: 'Scanner', icon: ScanSearch },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'report', label: 'AI Report', icon: FileText },
  { id: 'compare', label: 'Compare', icon: GitCompareArrows },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'history', label: 'History', icon: History },
  { id: 'about', label: 'About', icon: Info },
]

export function Header() {
  const { view, setView } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 w-full no-print border-b-[3px] border-border bg-background">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand — massive, uppercase */}
          <button
            onClick={() => setView('landing')}
            className="group flex items-center gap-3 shrink-0"
            aria-label="IdentityScope AI home"
          >
            <div className="h-9 w-9 border-[3px] border-border bg-foreground flex items-center justify-center">
              <ScanSearch className="h-5 w-5 text-background" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold tracking-tight uppercase">
                IdentityScope
              </span>
              <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">
                {"// AI"}
              </span>
            </div>
          </button>

          {/* Desktop nav — editorial, uppercase, underline active */}
          <nav className="hidden lg:flex items-center gap-0">
            {NAV.map((item) => {
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    'relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors',
                    active
                      ? 'bg-foreground text-background'
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
              className="hidden sm:flex h-9 w-9 items-center justify-center border-2 border-border hover:bg-foreground hover:text-background transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 inline-flex items-center justify-center border-2 border-border hover:bg-foreground hover:text-background transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </button>
            <Button
              size="sm"
              onClick={() => setView('scanner')}
              className="hidden sm:inline-flex border-2 border-border bg-accent text-accent-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-wider"
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
              New Scan
            </Button>
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

      {/* Mobile nav — blocky grid */}
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
                    'flex items-center gap-2 px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-r-2 border-border transition-colors',
                    active
                      ? 'bg-foreground text-background'
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
                'flex items-center gap-2 px-3 py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-border transition-colors',
                view === 'settings'
                  ? 'bg-foreground text-background'
                  : 'hover:bg-secondary'
              )}
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
              Settings
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider">
            <Shield className="h-4 w-4" strokeWidth={2.5} />
            <span>IdentityScope AI</span>
            <span className="text-muted-foreground">{"// "}Privacy-first · Public APIs only</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            <button onClick={() => setView('about')} className="hover:text-foreground transition-colors">
              About
            </button>
            <button onClick={() => setView('scanner')} className="hover:text-foreground transition-colors">
              Scanner
            </button>
            <a
              href="https://github.com/public-apis/public-apis"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Public APIs
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
