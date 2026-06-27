'use client'

import * as React from 'react'
import { Settings, Shield, Zap, Clock, Eye, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore, type View } from '@/stores/app-store'
import { Reveal } from '@/components/charts/animated'
import { toast } from 'sonner'

export function SettingsView() {
  const { settings, updateSettings } = useAppStore()

  function clearLocalData() {
    localStorage.removeItem('identityscope-store')
    toast.success('Local storage cleared')
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <Reveal>
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 gap-1.5">
            <Settings className="h-3 w-3" /> Settings
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your IdentityScope AI experience. All settings are stored locally.
          </p>
        </div>
      </Reveal>

      <div className="space-y-4">
        <Reveal delay={0.05}>
          <Card className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <Label className="font-semibold">Auto-generate AI report</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically generate the Gemini AI report after each scan completes.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.autoAiReport}
                onCheckedChange={(v) => updateSettings({ autoAiReport: v })}
              />
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <Label className="font-semibold">Show private signal placeholders</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Display "private signal not available" badges to remind that only public data is used.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.showPrivateSignals}
                onCheckedChange={(v) => updateSettings({ showPrivateSignals: v })}
              />
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <Label className="font-semibold">Cache TTL (minutes)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    How long connector results are cached on the server before re-fetching from upstreams.
                  </p>
                </div>
              </div>
              <Select
                value={String(settings.cacheTtlMinutes)}
                onValueChange={(v) => updateSettings({ cacheTtlMinutes: Number(v) })}
              >
                <SelectTrigger className="w-28 glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                  <Label className="font-semibold">Default view</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Which view to land on after opening the app.
                  </p>
                </div>
              </div>
              <Select
                value={settings.defaultView}
                onValueChange={(v) => updateSettings({ defaultView: v as View })}
              >
                <SelectTrigger className="w-32 glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landing">Landing</SelectItem>
                  <SelectItem value="scanner">Scanner</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.25}>
          <Card className="glass p-5 border-red-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <Label className="font-semibold">Clear local data</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remove all saved settings and preferences from this browser. Your scan history in the local DB is not affected.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={clearLocalData}>
                Clear
              </Button>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.3}>
          <Card className="glass p-5 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground block mb-1">Privacy commitment</strong>
                IdentityScope AI only uses public APIs. It never authenticates as you, never
                accesses private accounts, never bypasses any login, and never collects
                sensitive data. All analysis is based on publicly available information.
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
