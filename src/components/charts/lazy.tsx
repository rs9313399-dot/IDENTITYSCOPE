'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { ScoreSet, GitHubLanguageStat, ContributionWeek } from '@/lib/types'

const Loading = ({ height = 260 }: { height?: number }) => (
  <div style={{ height }} className="flex items-center justify-center">
    <Skeleton className="h-full w-full rounded-xl" />
  </div>
)

// Lazy-load the chart components to keep Recharts out of the initial bundle.
// The dashboard is the only place that uses these, so they only load when needed.
export const ScoreRadar = dynamic(
  () => import('./index').then((m) => m.ScoreRadar),
  { loading: () => <Loading height={300} />, ssr: false }
) as React.ComponentType<{ scores: ScoreSet }>

export const LanguagePie = dynamic(
  () => import('./index').then((m) => m.LanguagePie),
  { loading: () => <Loading height={260} />, ssr: false }
) as React.ComponentType<{ languages: GitHubLanguageStat[] }>

export const RepoBarChart = dynamic(
  () => import('./index').then((m) => m.RepoBarChart),
  { loading: () => <Loading height={260} />, ssr: false }
) as React.ComponentType<{ repos: { name: string; stars: number; forks: number }[] }>

export const CommitActivityChart = dynamic(
  () => import('./index').then((m) => m.CommitActivityChart),
  { loading: () => <Loading height={220} />, ssr: false }
) as React.ComponentType<{ data: { day: string; commits: number }[] }>

export const ContributionHeatmap = dynamic(
  () => import('./index').then((m) => m.ContributionHeatmap),
  { loading: () => <Loading height={140} />, ssr: false }
) as React.ComponentType<{ weeks: ContributionWeek[] }>
