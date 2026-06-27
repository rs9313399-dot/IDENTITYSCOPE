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
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${ringColor}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color: ringColor }}>
          {Math.round(value)}
        </span>
        {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>}
        {sublabel && <span className="text-[9px] text-muted-foreground/70">{sublabel}</span>}
      </div>
    </div>
  )
}

export function scoreColor(score: number) {
  if (score >= 75) return 'oklch(0.72 0.19 165)' // green
  if (score >= 55) return 'oklch(0.78 0.16 85)' // yellow-green
  if (score >= 35) return 'oklch(0.78 0.17 70)' // amber
  return 'oklch(0.68 0.22 25)' // red
}

export function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Good'
  if (score >= 40) return 'Fair'
  if (score >= 25) return 'Weak'
  return 'Critical'
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
