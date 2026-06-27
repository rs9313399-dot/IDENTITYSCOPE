'use client'

import * as React from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   CYBER BRUTALIST PRIMITIVE COMPONENT LIBRARY
   Handcrafted, reusable, production-grade.
   ============================================================ */

/* ----------------------------- BrutalButton ----------------------------- */

type ButtonVariant = 'default' | 'accent' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  default: 'border-2 border-border bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground',
  accent: 'border-2 border-accent bg-accent text-accent-foreground hover:bg-background hover:text-accent',
  outline: 'border-2 border-border bg-transparent text-foreground hover:bg-foreground hover:text-background',
  ghost: 'border-2 border-transparent bg-transparent text-foreground hover:bg-secondary hover:border-border',
  danger: 'border-2 border-[#FF3B30] bg-[#FF3B30] text-white hover:bg-background hover:text-[#FF3B30]',
}

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[11px] gap-1.5',
  md: 'h-11 px-5 text-xs gap-2',
  lg: 'h-14 px-8 text-sm gap-2.5',
}

export function BrutalButton({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all duration-75 active:translate-x-0 active:translate-y-0 hover:-translate-x-0.5 hover:-translate-y-0.5',
        BTN_VARIANTS[variant],
        BTN_SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ----------------------------- BrutalInput ----------------------------- */

export function BrutalInput({
  className,
  prefix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-accent text-sm pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        className={cn(
          'w-full bg-[#0A0A0A] border-2 border-border text-foreground font-mono uppercase tracking-wide placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)] transition-colors h-12 px-4 text-sm',
          prefix && 'pl-8',
          className
        )}
        {...props}
      />
    </div>
  )
}

/* ----------------------------- BrutalCard ----------------------------- */

export function BrutalCard({
  children,
  className,
  hover = false,
  accentTop = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  accentTop?: boolean
}) {
  return (
    <div
      className={cn(
        'relative bg-[#0A0A0A] border-2 border-border',
        accentTop && 'before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-accent before:content-[""]',
        hover && 'transition-all duration-100 hover:-translate-y-0.5 hover:border-accent',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ----------------------------- StatusBadge ----------------------------- */

type StatusType = 'found' | 'missing' | 'weak' | 'strong' | 'archived' | 'unknown'

const STATUS_STYLES: Record<StatusType, { bg: string; text: string; border: string; label: string }> = {
  found:   { bg: 'bg-accent', text: 'text-background', border: 'border-accent', label: 'FOUND' },
  missing: { bg: 'bg-[#FF3B30]', text: 'text-white', border: 'border-[#FF3B30]', label: 'MISSING' },
  weak:    { bg: 'bg-transparent', text: 'text-[#FFD60A]', border: 'border-[#FFD60A]', label: 'WEAK' },
  strong:  { bg: 'bg-accent', text: 'text-background', border: 'border-accent', label: 'STRONG' },
  archived:{ bg: 'bg-transparent', text: 'text-muted-foreground', border: 'border-muted-foreground', label: 'ARCHIVED' },
  unknown: { bg: 'bg-transparent', text: 'text-muted-foreground', border: 'border-border', label: 'UNKNOWN' },
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: StatusType
  label?: string
  className?: string
}) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest',
        s.bg, s.text, s.border,
        className
      )}
    >
      {label ?? s.label}
    </span>
  )
}

/* ----------------------------- RiskBadge ----------------------------- */

export function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const styles = {
    low: 'bg-accent text-background border-accent',
    medium: 'bg-[#FFD60A] text-background border-[#FFD60A]',
    high: 'bg-[#FF3B30] text-white border-[#FF3B30]',
  }
  return (
    <span className={cn('inline-flex items-center border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest', styles[level])}>
      RISK: {level.toUpperCase()}
    </span>
  )
}

/* ----------------------------- ScoreMeter ----------------------------- */

export function ScoreMeter({
  value,
  label,
  width = 24,
  animated = true,
}: {
  value: number
  label?: string
  width?: number
  animated?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-5% 0px' })
  const [displayVal, setDisplayVal] = React.useState(0)

  const color = value >= 70 ? '#00FF66' : value >= 40 ? '#FFD60A' : '#FF3B30'

  React.useEffect(() => {
    if (!inView || !animated) {
      setDisplayVal(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const dur = 800
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayVal(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, animated])

  const filled = Math.round((displayVal / 100) * width)

  return (
    <div ref={ref} className="font-mono">
      {label && (
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-[11px] leading-none tracking-tight overflow-hidden" style={{ color }}>
          [{'█'.repeat(filled)}{'░'.repeat(width - filled)}]
        </span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {displayVal}<span className="text-muted-foreground text-xs">/100</span>
        </span>
      </div>
    </div>
  )
}

/* ----------------------------- TerminalPanel ----------------------------- */

export function TerminalPanel({
  label,
  status,
  children,
  className,
  headerRight,
  delay = 0,
}: {
  label: string
  status?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerRight?: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative bg-[#0A0A0A] border-2 border-border', className)}
    >
      <div className="flex items-center justify-between bg-foreground text-background px-3 py-1.5 border-b-2 border-border">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 bg-accent" />
          {label}
        </span>
        <div className="flex items-center gap-2">
          {headerRight}
          {status}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  )
}

/* ----------------------------- ScanLog ----------------------------- */

export function ScanLog({
  ts,
  children,
  variant = 'default',
  show = true,
}: {
  ts: string
  children: React.ReactNode
  variant?: 'default' | 'ok' | 'err' | 'warn'
  show?: boolean
}) {
  const colorClass = {
    default: 'text-muted-foreground',
    ok: 'text-accent',
    err: 'text-[#FF3B30]',
    warn: 'text-[#FFD60A]',
  }[variant]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-[11px] leading-relaxed flex"
        >
          <span className="text-accent mr-2 shrink-0">[{ts}]</span>
          <span className={colorClass}>{children}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ----------------------------- DossierSection ----------------------------- */

export function DossierSection({
  number,
  title,
  status,
  children,
  className,
}: {
  number: string
  title: string
  status?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative bg-[#0A0A0A] border-2 border-border', className)}
    >
      <div className="flex items-stretch border-b-2 border-border">
        <div className="flex items-center px-3 py-2 bg-foreground text-background border-r-2 border-border">
          <span className="font-mono text-xs font-bold tabular-nums">{number}</span>
        </div>
        <div className="flex-1 flex items-center justify-between px-3 py-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest">{title}</h3>
          {status}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </motion.section>
  )
}

/* ----------------------------- AsciiSeparator ----------------------------- */

export function AsciiSeparator({ char = '─', className }: { char?: string; className?: string }) {
  return (
    <div
      className={cn('font-mono text-muted-foreground/20 overflow-hidden select-none leading-none', className)}
      aria-hidden
    >
      {char.repeat(200)}
    </div>
  )
}

/* ----------------------------- BgText (faded background typography) ----------------------------- */

export function BgText({
  children,
  className,
  position = 'top-left',
}: {
  children: React.ReactNode
  className?: string
  position?: 'top-left' | 'bottom-right' | 'center'
}) {
  const pos = {
    'top-left': 'top-8 -left-4',
    'bottom-right': 'bottom-0 -right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  }[position]
  return (
    <div
      className={cn(
        'absolute font-sans font-black select-none pointer-events-none uppercase whitespace-nowrap z-0',
        pos,
        className
      )}
      style={{
        fontSize: 'clamp(6rem, 16vw, 14rem)',
        color: 'var(--border)',
        opacity: 0.025,
        letterSpacing: '-0.05em',
        lineHeight: 0.8,
      }}
      aria-hidden
    >
      {children}
    </div>
  )
}

/* ----------------------------- ScanlineOverlay ----------------------------- */

export function ScanlineOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.025] mix-blend-overlay" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        }}
      />
    </div>
  )
}

/* ----------------------------- BrutalTable ----------------------------- */

export function BrutalTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div className="border-2 border-border overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-foreground text-background">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-mono text-[10px] font-bold uppercase tracking-widest border-r-2 border-background last:border-r-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-t-2 border-border hover:bg-foreground hover:text-background transition-colors group"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2.5 font-mono text-xs border-r-2 border-border last:border-r-0 group-hover:border-background"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ----------------------------- TypingText ----------------------------- */

export function TypingText({
  text,
  speed = 30,
  className,
  startDelay = 0,
  onComplete,
}: {
  text: string
  speed?: number
  className?: string
  startDelay?: number
  onComplete?: () => void
}) {
  const [displayed, setDisplayed] = React.useState('')
  const [started, setStarted] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  React.useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t)
  }, [inView, startDelay])

  React.useEffect(() => {
    if (!started) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(id)
  }, [started, text, speed, onComplete])

  return (
    <span ref={ref} className={className}>
      {displayed}
      <span className="cursor-blink" />
    </span>
  )
}

/* ----------------------------- CounterTick ----------------------------- */

export function CounterTick({
  value,
  duration = 1.2,
  suffix = '',
  className,
}: {
  value: number
  duration?: number
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
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {Math.round(display).toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
