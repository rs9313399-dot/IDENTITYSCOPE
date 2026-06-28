'use client'

import * as React from 'react'
import { useAppStore, ACCENT_COLORS } from '@/stores/app-store'

/**
 * Applies the user's selected brutalist accent color.
 * Accent blocks use dark ink text for the poster-like theme.
 */
export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const accent = useAppStore((s) => s.settings.accentColor)

  React.useEffect(() => {
    const color = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0]
    const root = document.documentElement
    root.style.setProperty('--accent', color.primary)
    root.style.setProperty('--accent-foreground', '#050505')
    root.style.setProperty('--ring', color.primary)
    root.style.setProperty('--chart-2', color.primary)
  }, [accent])

  return <>{children}</>
}
