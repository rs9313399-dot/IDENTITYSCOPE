'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'

/* ----------------------------- Empty State Illustrations ----------------------------- */

function EmptyScanIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto">
      <motion.circle
        cx="60" cy="60" r="50"
        stroke="oklch(0.72 0.19 265 / 0.2)"
        strokeWidth="2"
        strokeDasharray="6 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.circle
        cx="60" cy="60" r="35"
        fill="oklch(0.72 0.19 265 / 0.08)"
        stroke="oklch(0.72 0.19 265 / 0.3)"
        strokeWidth="1.5"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.path
        d="M60 40 L60 60 L72 72"
        stroke="oklch(0.72 0.19 265)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <circle cx="60" cy="60" r="3" fill="oklch(0.72 0.19 265)" />
    </svg>
  )
}

function EmptyBookIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto">
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="30" y="30" width="60" height="60" rx="8" fill="oklch(0.78 0.17 85 / 0.1)" stroke="oklch(0.78 0.17 85 / 0.4)" strokeWidth="2" />
        <line x1="42" y1="45" x2="78" y2="45" stroke="oklch(0.78 0.17 85 / 0.5)" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="55" x2="68" y2="55" stroke="oklch(0.78 0.17 85 / 0.3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="65" x2="72" y2="65" stroke="oklch(0.78 0.17 85 / 0.3)" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <motion.path
        d="M85 35 L92 42 L105 29"
        stroke="oklch(0.72 0.19 165)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  )
}

function EmptyHistoryIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto">
      <motion.circle
        cx="60" cy="60" r="45"
        fill="none"
        stroke="oklch(0.55 0.1 250 / 0.15)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <motion.rect x="35" y="38" width="50" height="10" rx="3" fill="oklch(0.55 0.1 250 / 0.1)" />
      <motion.rect x="35" y="55" width="50" height="10" rx="3" fill="oklch(0.55 0.1 250 / 0.08)" />
      <motion.rect x="35" y="72" width="50" height="10" rx="3" fill="oklch(0.55 0.1 250 / 0.06)" />
      <motion.circle
        cx="40" cy="43" r="2"
        fill="oklch(0.72 0.19 265)"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle
        cx="40" cy="60" r="2"
        fill="oklch(0.72 0.19 265)"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
    </svg>
  )
}

/* ----------------------------- Empty State Component ----------------------------- */

export function EmptyState({
  type,
  title,
  desc,
  actionLabel,
  onAction,
}: {
  type: 'scan' | 'bookmarks' | 'history' | 'report'
  title: string
  desc: string
  actionLabel: string
  onAction: () => void
}) {
  const Illustration =
    type === 'scan'
      ? EmptyScanIllustration
      : type === 'bookmarks'
        ? EmptyBookIllustration
        : type === 'history'
          ? EmptyHistoryIllustration
          : EmptyScanIllustration

  return (
    <Card className="glass p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.72_0.19_265/0.04),transparent_70%)]" />
      <div className="relative">
        <Illustration />
        <h3 className="font-semibold mb-1.5 mt-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{desc}</p>
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </Card>
  )
}
