'use client'

import * as React from 'react'
import { useAppStore, ACCENT_COLORS } from '@/stores/app-store'

/**
 * Applies the user's selected brutalist accent color to the document root.
 * Sets --accent, --accent-foreground, --primary stays B&W (brutalism:
 * primary is always black/white, accent is the single color highlight).
 */
export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const accent = useAppStore((s) => s.settings.accentColor)

  React.useEffect(() => {
    const color = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0]
    const root = document.documentElement
    root.style.setProperty('--accent', color.primary)
    // Yellow needs dark text on it for contrast; red/green use white.
    const fg = color.id === 'yellow' ? '#000000' : '#FFFFFF'
    root.style.setProperty('--accent-foreground', fg)
    root.style.setProperty('--destructive', color.primary)
    root.style.setProperty('--chart-2', color.primary)
    root.style.setProperty('--ring', color.primary)
  }, [accent])

  return <>{children}</>
}
