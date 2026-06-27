'use client'

import * as React from 'react'
import { useAppStore, type View } from '@/stores/app-store'

interface Shortcut {
  key: string
  view: View
  label: string
  description: string
}

const SHORTCUTS: Shortcut[] = [
  { key: 's', view: 'scanner', label: 'S', description: 'Go to Scanner' },
  { key: 'd', view: 'dashboard', label: 'D', description: 'Go to Dashboard' },
  { key: 'r', view: 'report', label: 'R', description: 'Go to AI Report' },
  { key: 'c', view: 'compare', label: 'C', description: 'Go to Compare' },
  { key: 'h', view: 'history', label: 'H', description: 'Go to History' },
  { key: 'b', view: 'bookmarks', label: 'B', description: 'Go to Bookmarks' },
  { key: 'a', view: 'about', label: 'A', description: 'Go to About' },
]

/** Global keyboard shortcuts for power-user navigation. */
export function useKeyboardShortcuts() {
  const setView = useAppStore((s) => s.setView)
  const [showHelp, setShowHelp] = React.useState(false)

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.tagName === 'SELECT'
      ) {
        return
      }

      // Help dialog
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShowHelp((v) => !v)
        return
      }

      // Escape closes help
      if (e.key === 'Escape') {
        setShowHelp(false)
        return
      }

      // Single-key shortcuts (no modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const shortcut = SHORTCUTS.find((s) => s.key === e.key.toLowerCase())
        if (shortcut) {
          e.preventDefault()
          setView(shortcut.view)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setView])

  return { showHelp, setShowHelp, shortcuts: SHORTCUTS }
}

/** Keyboard shortcuts help dialog — rendered in the layout. */
export function ShortcutsHelpDialog({
  open,
  onClose,
  shortcuts,
}: {
  open: boolean
  onClose: () => void
  shortcuts: Shortcut[]
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Keyboard shortcuts</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xs"
            aria-label="Close"
          >
            ESC
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{s.description}</span>
              <kbd className="px-2 py-1 rounded-md bg-muted text-xs font-mono font-semibold border border-border/60 min-w-[28px] text-center">
                {s.label}
              </kbd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 text-sm pt-2 border-t border-border/40 mt-3">
            <span className="text-muted-foreground">Show this help</span>
            <kbd className="px-2 py-1 rounded-md bg-muted text-xs font-mono font-semibold border border-border/60 min-w-[28px] text-center">
              ?
            </kbd>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          Shortcuts are disabled while typing in input fields.
        </p>
      </div>
    </div>
  )
}
