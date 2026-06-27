'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { blockMeter } from '@/components/charts/animated'

/** Terminal-style dossier panel with header strip. */
export function TerminalPanel({
  label,
  status,
  children,
  className,
  headerRight,
}: {
  label: string
  status?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerRight?: React.ReactNode
}) {
  return (
    <div className={cn('terminal-panel', className)}>
      <div className="dossier-header">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          {headerRight}
          {status}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

/** Stamped status tag. */
export function StatusTag({
  status,
  children,
}: {
  status: 'found' | 'missing' | 'weak' | 'strong' | 'archived'
  children?: React.ReactNode
}) {
  const cls = {
    found: 'status-found',
    missing: 'status-missing',
    weak: 'status-weak',
    strong: 'status-strong',
    archived: 'status-archived',
  }[status]
  const label = {
    found: 'FOUND',
    missing: 'MISSING',
    weak: 'WEAK',
    strong: 'STRONG',
    archived: 'ARCHIVED',
  }[status]
  return <span className={cn('badge-brutal', cls)}>{children ?? label}</span>
}

/** Risk tag — for security/threat labels. */
export function RiskTag({ level }: { level: 'low' | 'medium' | 'high' }) {
  const cls = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' }[level]
  const label = { low: 'RISK: LOW', medium: 'RISK: MEDIUM', high: 'RISK: HIGH' }[level]
  return <span className={cn('badge-brutal', cls)}>{label}</span>
}

/** Block meter — ASCII-style score bar. */
export function BlockMeter({
  value,
  label,
  width = 20,
}: {
  value: number
  label?: string
  width?: number
}) {
  const color =
    value >= 70 ? '#00FF66' : value >= 40 ? '#FFD60A' : '#FF3B30'
  return (
    <div className="font-mono text-xs leading-relaxed">
      {label && <div className="text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>}
      <div className="flex items-center gap-2">
        <span style={{ color }}>{blockMeter(value, 100, width)}</span>
        <span className="font-bold tabular-nums" style={{ color }}>
          {value}/100
        </span>
      </div>
    </div>
  )
}

/** Scan log line — terminal output style. */
export function ScanLog({
  ts,
  children,
  variant = 'default',
}: {
  ts: string
  children: React.ReactNode
  variant?: 'default' | 'ok' | 'err' | 'warn'
}) {
  const cls = {
    default: '',
    ok: 'ok',
    err: 'err',
    warn: 'warn',
  }[variant]
  return (
    <div className="scan-log">
      <span className="ts">[{ts}]</span>
      <span className={cls}>{children}</span>
    </div>
  )
}

/** ASCII separator line. */
export function AsciiSeparator({ char = '─', className }: { char?: string; className?: string }) {
  return (
    <div
      className={cn('font-mono text-muted-foreground/40 overflow-hidden select-none', className)}
      aria-hidden
    >
      {char.repeat(200)}
    </div>
  )
}

/** Faded background text — large system label. */
export function BgText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bg-text-faded', className)}>{children}</div>
}
