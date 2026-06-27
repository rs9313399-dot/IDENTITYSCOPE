'use client'

import * as React from 'react'
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

export interface ScanProgressEvent {
  connector: string
  name: string
  status: 'found' | 'not_found' | 'error' | 'skipped'
  error?: string
}

/**
 * Streaming scan hook — emits per-connector progress events.
 * Returns { mutate, isPending, progress, activeConnectors, reset }.
 */
export function useScanStream() {
  const { setCurrentReport, setView, setLastInput } = useAppStore()
  const [isPending, setIsPending] = React.useState(false)
  const [progress, setProgress] = React.useState<ScanProgressEvent[]>([])
  const [activeConnectors, setActiveConnectors] = React.useState<string[]>([])

  const mutate = React.useCallback(
    async (input: ScanInput) => {
      setIsPending(true)
      setProgress([])
      setActiveConnectors([])
      setLastInput(input)

      try {
        const res = await fetch('/api/scan-stream', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok || !res.body) throw new Error('Scan stream failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const evt = JSON.parse(line.slice(6))
              if (evt.type === 'start') {
                setActiveConnectors(evt.connectors)
              } else if (evt.type === 'progress') {
                setProgress((prev) => [
                  ...prev,
                  {
                    connector: evt.connector,
                    name: evt.name,
                    status: evt.status,
                    error: evt.error,
                  },
                ])
              } else if (evt.type === 'done') {
                const report = evt.report as DigitalIdentityReport
                setCurrentReport(report)
                setView('dashboard')
                toast.success(`Scan complete — overall score ${report.scores.overall}/100`)
              }
            } catch {
              /* skip */
            }
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Scan failed')
      } finally {
        setIsPending(false)
      }
    },
    [setCurrentReport, setView, setLastInput]
  )

  const reset = React.useCallback(() => {
    setProgress([])
    setActiveConnectors([])
    setIsPending(false)
  }, [])

  return { mutate, isPending, progress, activeConnectors, reset }
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

/**
 * Streaming AI report hook.
 * Calls /api/ai-report-stream and invokes onToken for each streamed token.
 * Returns { mutate, isPending, streamedText, reset }.
 */
export function useAiReportStream() {
  const [isPending, setIsPending] = React.useState(false)
  const [streamedText, setStreamedText] = React.useState('')

  const mutate = React.useCallback(
    async (
      report: DigitalIdentityReport,
      options?: {
        onToken?: (text: string) => void
        onDone?: (ai: AIReport) => void
        onError?: (err: Error) => void
      }
    ) => {
      setIsPending(true)
      setStreamedText('')
      let acc = ''
      try {
        const res = await fetch('/api/ai-report-stream', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ report }),
        })
        if (!res.ok || !res.body) throw new Error('Stream failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const evt = JSON.parse(line.slice(6))
              if (evt.type === 'token' && evt.content) {
                acc += evt.content
                setStreamedText(acc)
                options?.onToken?.(evt.content)
              } else if (evt.type === 'done' && evt.report) {
                options?.onDone?.(evt.report)
                if (evt.fallback) toast.info('AI stream fell back to deterministic report')
                else toast.success('AI report generated')
              } else if (evt.type === 'error') {
                if (evt.report) options?.onDone?.(evt.report)
                else options?.onError?.(new Error(evt.message || 'unknown'))
              }
            } catch {
              /* skip */
            }
          }
        }
      } catch (err) {
        options?.onError?.(err instanceof Error ? err : new Error('unknown'))
        toast.error('AI report generation failed')
      } finally {
        setIsPending(false)
      }
    },
    []
  )

  const reset = React.useCallback(() => {
    setStreamedText('')
    setIsPending(false)
  }, [])

  return { mutate, isPending, streamedText, reset }
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
