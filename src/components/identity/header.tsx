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
    <header className="sticky top-0 z-40 w-full no-print">
      <div className="glass-strong border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <button
              onClick={() => setView('landing')}
              className="group flex items-center gap-2.5 shrink-0"
              aria-label="IdentityScope AI home"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.25_305)] blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.25_305)] flex items-center justify-center shadow-lg">
                  <ScanSearch className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-bold tracking-tight">
                  IdentityScope <span className="gradient-text">AI</span>
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  Digital identity, decoded
                </span>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => {
                const active = view === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={cn(
                      'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-accent/80 border border-border/60"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors"
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
                className="hidden sm:inline-flex glow-primary"
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                New Scan
              </Button>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-accent/60"
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
            className="lg:hidden border-t border-border/40 overflow-hidden"
          >
            <nav className="px-4 py-3 grid grid-cols-2 gap-1.5">
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
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
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
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors col-span-2',
                  view === 'settings'
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}

export function Footer() {
  const setView = useAppStore((s) => s.setView)
  return (
    <footer className="mt-auto border-t border-border/40 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>
              <span className="font-semibold text-foreground">IdentityScope AI</span> — privacy-first,
              public-APIs only.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
            <span className="opacity-60">No accounts accessed. No data sold.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
