'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DigitalIdentityReport, ScanInput } from '@/lib/types'

export type View =
  | 'landing'
  | 'scanner'
  | 'dashboard'
  | 'report'
  | 'compare'
  | 'bookmarks'
  | 'history'
  | 'settings'
  | 'about'

export type AccentColor = 'green' | 'amber' | 'cyan'

export const ACCENT_COLORS: { id: AccentColor; label: string; primary: string; preview: string }[] = [
  { id: 'green', label: 'Green', primary: '#00FF66', preview: '#00FF66' },
  { id: 'amber', label: 'Amber', primary: '#FFD60A', preview: '#FFD60A' },
  { id: 'cyan', label: 'Cyan', primary: '#00E5FF', preview: '#00E5FF' },
]

interface AppState {
  view: View
  setView: (v: View) => void

  currentReport: DigitalIdentityReport | null
  setCurrentReport: (r: DigitalIdentityReport | null) => void

  lastInput: ScanInput | null
  setLastInput: (i: ScanInput | null) => void

  comparePair: { left: DigitalIdentityReport | null; right: DigitalIdentityReport | null }
  setCompare: (side: 'left' | 'right', r: DigitalIdentityReport | null) => void

  // settings
  settings: {
    autoAiReport: boolean
    showPrivateSignals: boolean
    defaultView: View
    cacheTtlMinutes: number
    accentColor: AccentColor
  }
  updateSettings: (s: Partial<AppState['settings']>) => void
  setAccentColor: (c: AccentColor) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'landing',
      setView: (view) => set({ view }),

      currentReport: null,
      setCurrentReport: (currentReport) => set({ currentReport }),

      lastInput: null,
      setLastInput: (lastInput) => set({ lastInput }),

      comparePair: { left: null, right: null },
      setCompare: (side, r) =>
        set((s) => ({ comparePair: { ...s.comparePair, [side]: r } })),

      settings: {
        autoAiReport: true,
        showPrivateSignals: false,
        defaultView: 'scanner',
        cacheTtlMinutes: 10,
        accentColor: 'green',
      },
      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
      setAccentColor: (c) =>
        set((state) => ({ settings: { ...state.settings, accentColor: c } })),
    }),
    {
      name: 'identityscope-store',
      partialize: (s) => ({ settings: s.settings, lastInput: s.lastInput }),
    }
  )
)
