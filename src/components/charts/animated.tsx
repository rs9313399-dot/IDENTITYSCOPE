'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'

/** Animated counter that smoothly counts up to a target number when in view. */
export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const from = 0
    const to = value
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

/** Circular progress ring with animated stroke. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  color,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  color?: string
}) {
  const ref = React.useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const targetOffset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ
  const [offset, setOffset] = React.useState(circ)

  React.useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setOffset(targetOffset), 80)
    return () => clearTimeout(t)
  }, [inView, targetOffset])

  const ringColor = color ?? scoreColor(value)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color: ringColor }}>
          {Math.round(value)}
        </span>
        {label && <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{label}</span>}
        {sublabel && <span className="text-[9px] font-mono text-muted-foreground/70">{sublabel}</span>}
      </div>
    </div>
  )
}

/** Brutalist score color — uses the accent for high scores, foreground for mid, muted for low. */
export function scoreColor(score: number) {
  if (typeof window !== 'undefined') {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
    const muted = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim()
    if (score >= 75) return accent || '#FF3B30'
    if (score >= 40) return fg || '#000000'
    return muted || '#888888'
  }
  // SSR fallback
  if (score >= 75) return '#FF3B30'
  if (score >= 40) return '#000000'
  return '#888888'
}

export function scoreLabel(score: number) {
  if (score >= 85) return 'EXCELLENT'
  if (score >= 70) return 'STRONG'
  if (score >= 55) return 'GOOD'
  if (score >= 40) return 'FAIR'
  if (score >= 25) return 'WEAK'
  return 'CRITICAL'
}

/** Fade + slide in wrapper. */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export { AnimatePresence }
