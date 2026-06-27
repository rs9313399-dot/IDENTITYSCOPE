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
  { key: 'developer', label: 'Developer' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'openSource', label: 'Open Source' },
  { key: 'repository', label: 'Repository' },
  { key: 'documentation', label: 'Docs' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'security', label: 'Security' },
  { key: 'community', label: 'Community' },
  { key: 'brand', label: 'Brand' },
]

export function ScoreRadar({ scores }: { scores: ScoreSet }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const data = RADAR_KEYS.map(({ key, label }) => ({ subject: label, value: scores[key] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)', fontSize: 11 }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="oklch(0.72 0.19 265)"
          fill="oklch(0.72 0.19 265)"
          fillOpacity={0.35}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: isDark ? 'rgba(20,20,28,0.95)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            fontSize: 12,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function LanguagePie({ languages }: { languages: GitHubLanguageStat[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const data = languages.slice(0, 8).map((l) => ({ name: l.language, value: l.percentage, color: l.color }))
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
          paddingAngle={2}
          stroke="none"
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: isDark ? 'rgba(20,20,28,0.95)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            fontSize: 12,
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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const data = repos.slice(0, 8).map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 11) + '…' : r.name,
    Stars: r.stars,
    Forks: r.forks,
  }))
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)', fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={56} />
        <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)', fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: isDark ? 'rgba(20,20,28,0.95)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            fontSize: 12,
          }}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="Stars" fill="oklch(0.72 0.19 265)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Forks" fill="oklch(0.7 0.25 305)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CommitActivityChart({
  data,
}: {
  data: { day: string; commits: number }[]
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.19 265)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="oklch(0.72 0.19 265)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
        <XAxis dataKey="day" tick={{ fill: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)', fontSize: 11 }} />
        <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)', fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: isDark ? 'rgba(20,20,28,0.95)' : 'rgba(255,255,255,0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="commits" stroke="oklch(0.72 0.19 265)" strokeWidth={2} fill="url(#commitGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const LEVEL_COLORS = [
  'oklch(0.22 0.015 255 / 0.6)',
  'oklch(0.72 0.19 265 / 0.45)',
  'oklch(0.72 0.19 265 / 0.7)',
  'oklch(0.72 0.19 265 / 0.85)',
  'oklch(0.72 0.19 265)',
]

export function ContributionHeatmap({ weeks }: { weeks: ContributionWeek[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  if (!weeks || weeks.length === 0) return null
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  // Compute month label positions
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

  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <div className="min-w-[640px]">
        <div className="flex pl-7 mb-1">
          {months.map((m, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground"
              style={{ position: 'absolute', left: `calc(1.75rem + ${m.index * 13}px)` }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] pr-1 justify-around text-[9px] text-muted-foreground">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((w, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {w.days.map((d, di) => (
                  <div
                    key={di}
                    className="heatmap-cell rounded-[2px]"
                    title={`${d.date}: ${d.count} contributions`}
                    style={{
                      width: 10,
                      height: 10,
                      background:
                        d.level === 0
                          ? isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.06)'
                          : LEVEL_COLORS[d.level],
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{
                width: 10,
                height: 10,
                background: i === 0 ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : c,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
