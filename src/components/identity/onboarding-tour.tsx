'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanSearch,
  LayoutDashboard,
  Brain,
  GitCompareArrows,
  History,
  Shield,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore, type View } from '@/stores/app-store'

interface TourStep {
  icon: React.ElementType
  title: string
  desc: string
  view?: View
  color: string
}

const STEPS: TourStep[] = [
  {
    icon: ScanSearch,
    title: 'Start a scan',
    desc: 'Enter a username, GitHub handle, website, or email to analyze a digital identity across 15+ public APIs.',
    view: 'scanner',
    color: 'oklch(0.72 0.19 265)',
  },
  {
    icon: LayoutDashboard,
    title: 'Explore the dashboard',
    desc: 'See scores across 10 dimensions, GitHub analysis, contribution heatmap, social discovery, and quick insights — all in one place.',
    view: 'dashboard',
    color: 'oklch(0.7 0.25 305)',
  },
  {
    icon: Brain,
    title: 'Generate an AI report',
    desc: 'Gemini writes a professional report with executive summary, strengths, weaknesses, career suggestions, and a learning roadmap — streamed live.',
    view: 'report',
    color: 'oklch(0.76 0.17 165)',
  },
  {
    icon: GitCompareArrows,
    title: 'Compare two identities',
    desc: 'Run side-by-side scans to compare followers, stars, languages, and scores with winner badges for each metric.',
    view: 'compare',
    color: 'oklch(0.78 0.17 85)',
  },
  {
    icon: History,
    title: 'Track your history',
    desc: 'All scans are saved locally. Bookmark reports, search past scans, and export them as Markdown or JSON.',
    view: 'history',
    color: 'oklch(0.7 0.19 22)',
  },
  {
    icon: Shield,
    title: 'Privacy-first by design',
    desc: 'Only public APIs are used. No authentication is ever bypassed. No private data is accessed. Your scans stay in your browser.',
    view: 'about',
    color: 'oklch(0.72 0.19 165)',
  },
]

const STORAGE_KEY = 'identityscope-tour-completed'

export function OnboardingTour() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const setView = useAppStore((s) => s.setView)

  React.useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY)
      if (!done) {
        // Small delay so the page loads first
        const t = setTimeout(() => setOpen(true), 800)
        return () => clearTimeout(t)
      }
    } catch {
      /* ignore */
    }
  }, [])

  function close() {
    setOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  function next() {
    if (step < STEPS.length - 1) {
      const s = STEPS[step + 1]
      if (s.view) setView(s.view)
      setStep(step + 1)
    } else {
      close()
      setView('scanner')
    }
  }

  function prev() {
    if (step > 0) {
      const s = STEPS[step - 1]
      if (s.view) setView(s.view)
      setStep(step - 1)
    }
  }

  function skip() {
    close()
    setView('landing')
  }

  if (!open) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm no-print p-4"
        onClick={close}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(ellipse at top, ${current.color}, transparent 70%)`,
            }}
          />

          {/* Close button */}
          <button
            onClick={skip}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-accent/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: i === step ? 24 : 8,
                    background: i <= step ? current.color : 'oklch(0.5 0.05 250 / 0.3)',
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <motion.div
              key={step}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: current.color + '22', color: current.color }}
            >
              <Icon className="h-8 w-8" />
            </motion.div>

            {/* Content */}
            <motion.div
              key={`content-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h3 className="font-bold text-lg mb-2">{current.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {current.desc}
              </p>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={skip} className="text-xs">
                Skip tour
              </Button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button variant="outline" size="sm" onClick={prev}>
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={next}>
                  {isLast ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Get started
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Step counter */}
            <div className="text-center text-[10px] text-muted-foreground mt-4">
              Step {step + 1} of {STEPS.length}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
