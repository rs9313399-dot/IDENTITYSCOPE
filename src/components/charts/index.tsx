'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import type { ScoreSet, GitHubLanguageStat, ContributionWeek } from '@/lib/types'
import { useTheme } from 'next-themes'

const RADAR_KEYS: { key: keyof ScoreSet; label: string }[] = [
  { key: 'developer', label: 'DEV' },
  { key: 'portfolio', label: 'PORT' },
  { key: 'openSource', label: 'OSS' },
  { key: 'repository', label: 'REPO' },
  { key: 'documentation', label: 'DOCS' },
  { key: 'consistency', label: 'CONS' },
  { key: 'security', label: 'SEC' },
  { key: 'community', label: 'COMM' },
  { key: 'brand', label: 'BRAND' },
]

function useChartColors() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return {
    isDark,
    fg: isDark ? '#FFFFFF' : '#000000',
    bg: isDark ? '#000000' : '#FFFFFF',
    muted: isDark ? '#888888' : '#555555',
    grid: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    tick: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
    accent: typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF3B30'
      : '#FF3B30',
    secondary: isDark ? '#555555' : '#999999',
    tooltipBg: isDark ? '#000000' : '#FFFFFF',
    tooltipBorder: isDark ? '#FFFFFF' : '#000000',
  }
}

export function ScoreRadar({ scores }: { scores: ScoreSet }) {
  const c = useChartColors()
  const data = RADAR_KEYS.map(({ key, label }) => ({ subject: label, value: scores[key] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={c.grid} strokeWidth={1} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: c.tick, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="value"
          stroke={c.accent}
          fill={c.accent}
          fillOpacity={0.4}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: c.tooltipBg,
            border: `2px solid ${c.tooltipBorder}`,
            borderRadius: 0,
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
          labelStyle={{ color: c.fg }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function LanguagePie({ languages }: { languages: GitHubLanguageStat[] }) {
  const c = useChartColors()
  // Brutalist: only black, accent, and grays. Map language colors to monochrome palette.
  const palette = [c.fg, c.accent, c.muted, c.secondary, c.grid, c.fg, c.accent, c.muted]
  const data = languages.slice(0, 8).map((l, i) => ({ name: l.language, value: l.percentage, color: palette[i % palette.length] }))
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={0}
          stroke={c.fg}
          strokeWidth={2}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: c.tooltipBg,
            border: `2px solid ${c.tooltipBorder}`,
            borderRadius: 0,
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
          formatter={(v: number, n: string) => [`${v}%`, n]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function RepoBarChart({
  repos,
}: {
  repos: { name: string; stars: number; forks: number }[]
}) {
  const c = useChartColors()
  const data = repos.slice(0, 8).map((r) => ({
    name: r.name.length > 10 ? r.name.slice(0, 9) + '…' : r.name.toUpperCase(),
    Stars: r.stars,
    Forks: r.forks,
  }))
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="0" stroke={c.grid} vertical={false} strokeWidth={1} />
        <XAxis dataKey="name" tick={{ fill: c.tick, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }} interval={0} angle={-25} textAnchor="end" height={56} />
        <YAxis tick={{ fill: c.tick, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: c.tooltipBg,
            border: `2px solid ${c.tooltipBorder}`,
            borderRadius: 0,
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
          cursor={{ fill: c.grid }}
        />
        <Bar dataKey="Stars" fill={c.accent} radius={[0, 0, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Forks" fill={c.fg} radius={[0, 0, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CommitActivityChart({
  data,
}: {
  data: { day: string; commits: number }[]
}) {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accent} stopOpacity={0.8} />
            <stop offset="100%" stopColor={c.accent} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke={c.grid} vertical={false} strokeWidth={1} />
        <XAxis dataKey="day" tick={{ fill: c.tick, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }} />
        <YAxis tick={{ fill: c.tick, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: c.tooltipBg,
            border: `2px solid ${c.tooltipBorder}`,
            borderRadius: 0,
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        />
        <Area type="monotone" dataKey="commits" stroke={c.accent} strokeWidth={2} fill="url(#commitGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ContributionHeatmap({ weeks }: { weeks: ContributionWeek[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  if (!weeks || weeks.length === 0) return null
  const accent = typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF3B30'
    : '#FF3B30'
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const months: { label: string; index: number }[] = []
  let lastMonth = -1
  weeks.forEach((w, i) => {
    const firstDay = w.days[0]
    if (firstDay) {
      const m = new Date(firstDay.date).getMonth()
      if (m !== lastMonth) {
        months.push({ label: monthLabels[m], index: i })
        lastMonth = m
      }
    }
  })

  const LEVEL_OPACITIES = [0.05, 0.3, 0.55, 0.8, 1]

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <div className="min-w-[640px]">
        <div className="flex pl-7 mb-1 relative h-4">
          {months.map((m, i) => (
            <div
              key={i}
              className="text-[10px] font-mono font-bold text-muted-foreground absolute"
              style={{ left: `calc(1.75rem + ${m.index * 13}px)` }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] pr-1 justify-around text-[9px] font-mono font-bold text-muted-foreground">
            <span>MON</span>
            <span>WED</span>
            <span>FRI</span>
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((w, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {w.days.map((d, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    title={`${d.date}: ${d.count} contributions`}
                    style={{
                      width: 10,
                      height: 10,
                      background: d.level === 0
                        ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
                        : accent,
                      opacity: d.level === 0 ? 1 : LEVEL_OPACITIES[d.level],
                      border: d.level > 0 ? '1px solid var(--border)' : 'none',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] font-mono font-bold text-muted-foreground">
          <span>LESS</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              style={{
                width: 10,
                height: 10,
                background: lvl === 0 ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : accent,
                opacity: lvl === 0 ? 1 : LEVEL_OPACITIES[lvl],
                border: lvl > 0 ? '1px solid var(--border)' : 'none',
              }}
            />
          ))}
          <span>MORE</span>
        </div>
      </div>
    </div>
  )
}
