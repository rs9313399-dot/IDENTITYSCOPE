'use client'

import * as React from 'react'
import { useAppStore, ACCENT_COLORS } from '@/stores/app-store'

/**
 * Applies the user's selected accent color to the document root as CSS variables.
 * Overrides --primary, --ring, --sidebar-primary, and --sidebar-ring.
 */
export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const accent = useAppStore((s) => s.settings.accentColor)

  React.useEffect(() => {
    const color = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0]
    const root = document.documentElement
    // Apply to both light and dark themes via the --primary variable.
    // We use the same oklch value for both since our accent colors work on dark.
    root.style.setProperty('--primary', color.primary)
    root.style.setProperty('--ring', color.primary)
    root.style.setProperty('--sidebar-primary', color.primary)
    root.style.setProperty('--sidebar-ring', color.primary)
  }, [accent])

  return <>{children}</>
}
