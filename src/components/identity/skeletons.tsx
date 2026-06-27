'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Dashboard skeleton shown during a scan / while loading a report. */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1.5" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* Top row: score ring + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="glass p-6 flex flex-col items-center justify-center">
          <Skeleton className="h-10 w-24 mb-3" />
          <Skeleton className="h-40 w-40 rounded-full" />
          <Skeleton className="h-4 w-20 mt-3" />
        </Card>
        <Card className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </Card>
      </div>

      {/* Score grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="glass p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-7 w-10" />
            </div>
            <Skeleton className="h-3 w-20 mb-1.5" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </Card>
        ))}
      </div>

      {/* Quick insights skeleton */}
      <Card className="glass-strong p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </Card>

      {/* Tabs skeleton */}
      <Card className="glass p-2 mb-4">
        <div className="flex gap-2 p-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
          ))}
        </div>
      </Card>

      {/* Content skeleton */}
      <Card className="glass p-6">
        <div className="flex gap-5 mb-5">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Card>
    </div>
  )
}

/** Scanner skeleton for the form loading state */
export function ScannerSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <Skeleton className="h-6 w-32 rounded-full mx-auto mb-3" />
        <Skeleton className="h-10 w-80 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <Card className="glass-strong p-8">
        <Skeleton className="h-14 w-full rounded-xl mb-5" />
        <div className="grid sm:grid-cols-3 gap-3">
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      </Card>
    </div>
  )
}
