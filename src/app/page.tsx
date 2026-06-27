'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Header, Footer } from '@/components/identity/header'
import { LandingView } from '@/components/identity/landing-view'
import { ScannerView } from '@/components/identity/scanner-view'
import { DashboardView } from '@/components/identity/dashboard-view'
import { ReportView } from '@/components/identity/report-view'
import { CompareView } from '@/components/identity/compare-view'
import { HistoryView } from '@/components/identity/history-view'
import { BookmarksView } from '@/components/identity/bookmarks-view'
import { SettingsView } from '@/components/identity/settings-view'
import { AboutView } from '@/components/identity/about-view'
import { useAppStore } from '@/stores/app-store'

export default function Home() {
  const view = useAppStore((s) => s.view)

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'landing' && <LandingView />}
            {view === 'scanner' && <ScannerView />}
            {view === 'dashboard' && <DashboardView />}
            {view === 'report' && <ReportView />}
            {view === 'compare' && <CompareView />}
            {view === 'history' && <HistoryView />}
            {view === 'bookmarks' && <BookmarksView />}
            {view === 'settings' && <SettingsView />}
            {view === 'about' && <AboutView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
