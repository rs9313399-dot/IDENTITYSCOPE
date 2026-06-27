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

export type AccentColor = 'violet' | 'emerald' | 'rose' | 'amber' | 'cyan'

export const ACCENT_COLORS: { id: AccentColor; label: string; primary: string; preview: string }[] = [
  { id: 'violet', label: 'Violet', primary: 'oklch(0.72 0.19 265)', preview: 'oklch(0.72 0.19 265)' },
  { id: 'emerald', label: 'Emerald', primary: 'oklch(0.72 0.19 165)', preview: 'oklch(0.72 0.19 165)' },
  { id: 'rose', label: 'Rose', primary: 'oklch(0.7 0.2 15)', preview: 'oklch(0.7 0.2 15)' },
  { id: 'amber', label: 'Amber', primary: 'oklch(0.78 0.16 75)', preview: 'oklch(0.78 0.16 75)' },
  { id: 'cyan', label: 'Cyan', primary: 'oklch(0.72 0.14 200)', preview: 'oklch(0.72 0.14 200)' },
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
        accentColor: 'violet',
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
