'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { DigitalIdentityReport, ScanInput, AIReport } from '@/lib/types'
import { useAppStore } from '@/stores/app-store'

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export function useScan() {
  const { setCurrentReport, setView, setLastInput } = useAppStore()
  return useMutation({
    mutationFn: (input: ScanInput) =>
      postJSON<DigitalIdentityReport>('/api/scan', input),
    onSuccess: (report) => {
      setCurrentReport(report)
      setLastInput(report.input)
      setView('dashboard')
      toast.success(`Scan complete — overall score ${report.scores.overall}/100`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Scan failed')
    },
  })
}

export function useAiReport() {
  return useMutation({
    mutationFn: (report: DigitalIdentityReport) =>
      postJSON<AIReport>('/api/ai-report', { report }),
    onSuccess: () => {
      toast.success('AI report regenerated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'AI report generation failed')
    },
  })
}

export function useHistory(q?: string) {
  return useQuery({
    queryKey: ['history', q ?? ''],
    queryFn: async () => {
      const res = await fetch(`/api/history?q=${encodeURIComponent(q ?? '')}`)
      if (!res.ok) throw new Error('Failed to load history')
      return res.json() as Promise<{
        scans: Array<{
          id: string
          query: string
          queryType: string
          github: string | null
          email: string | null
          website: string | null
          overallScore: number | null
          developerScore: number | null
          portfolioScore: number | null
          bookmarked: boolean
          createdAt: string
        }>
      }>
    },
  })
}

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await fetch('/api/bookmarks')
      if (!res.ok) throw new Error('Failed to load bookmarks')
      return res.json() as Promise<{
        scans: Array<{
          id: string
          query: string
          queryType: string
          github: string | null
          overallScore: number | null
          createdAt: string
        }>
      }>
    },
  })
}

export function useConnectors() {
  return useQuery({
    queryKey: ['connectors'],
    queryFn: async () => {
      const res = await fetch('/api/connectors')
      if (!res.ok) throw new Error('Failed to load connectors')
      return res.json() as Promise<{
        connectors: Array<{
          id: string
          name: string
          category: string
          description: string
          auth: boolean
        }>
      }>
    },
    staleTime: 60 * 60 * 1000,
  })
}

export async function loadScanById(id: string): Promise<DigitalIdentityReport | null> {
  const res = await fetch(`/api/history/${id}`)
  if (!res.ok) return null
  const data = await res.json()
  if (!data.reportJson) return null
  try {
    return JSON.parse(data.reportJson) as DigitalIdentityReport
  } catch {
    return null
  }
}

export async function toggleBookmark(id: string, bookmarked: boolean) {
  const res = await fetch(`/api/bookmarks?id=${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ bookmarked }),
  })
  if (!res.ok) throw new Error('Failed to toggle bookmark')
  return res.json()
}

export async function deleteScan(id: string) {
  const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete scan')
  return res.json()
}
