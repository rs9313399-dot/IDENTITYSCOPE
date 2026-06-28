'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  Link as LinkIcon,
  FileJson,
  FileDown,
  Twitter,
  Linkedin,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DigitalIdentityReport } from '@/lib/types'
import { toast } from 'sonner'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  report: DigitalIdentityReport | null
}

export function ShareModal({ open, onClose, report }: ShareModalProps) {
  const [copied, setCopied] = React.useState<string | null>(null)
  const [includeScores, setIncludeScores] = React.useState(true)
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href

  if (!open || !report) return null

  const shareText = `Check out my IdentityScope AI digital identity report for ${report.input.query} — overall score ${report.scores.overall}/100!`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent('My Digital Identity Report')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  function downloadJson() {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `identityscope-${report.input.query}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report JSON downloaded')
  }

  function downloadMarkdown() {
    if (!report) return
    const md = reportToMarkdown(report, includeScores)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `identityscope-${report.input.query}-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report Markdown downloaded')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm no-print p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/40">
            <div>
              <h3 className="font-bold text-base">Share report</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Spread your digital identity insights
              </p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-5 space-y-5">
            {/* Social share buttons */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Share to
              </div>
              <div className="grid grid-cols-4 gap-2">
                <SocialButton href={twitterUrl} icon={Twitter} label="Twitter" color="oklch(0.65 0.2 255)" />
                <SocialButton href={linkedinUrl} icon={Linkedin} label="LinkedIn" color="oklch(0.55 0.18 255)" />
                <SocialButton href={emailUrl} icon={Mail} label="Email" color="oklch(0.7 0.2 165)" />
                <SocialButton
                  href={shareUrl}
                  icon={MessageSquare}
                  label="Copy link"
                  color="oklch(0.7 0.25 305)"
                  onClick={(e) => {
                    e.preventDefault()
                    copyToClipboard(shareUrl, 'Link')
                  }}
                />
              </div>
            </div>

            {/* Copy link */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Report link
              </div>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg glass text-xs font-mono text-muted-foreground truncate">
                  <LinkIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{shareUrl}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl, 'Link')}
                  className="shrink-0"
                >
                  {copied === 'Link' ? (
                    <><Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>
                  )}
                </Button>
              </div>
            </div>

            {/* Export options */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Export report
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={downloadMarkdown} className="justify-start h-auto py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileDown className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">Markdown</div>
                      <div className="text-[10px] text-muted-foreground">.md file</div>
                    </div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" onClick={downloadJson} className="justify-start h-auto py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileJson className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold">JSON</div>
                      <div className="text-[10px] text-muted-foreground">full data</div>
                    </div>
                  </div>
                </Button>
              </div>
              <label className="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScores}
                  onChange={(e) => setIncludeScores(e.target.checked)}
                  className="rounded"
                />
                Include detailed scores in Markdown
              </label>
            </div>

            {/* Report summary card */}
            <div className="glass rounded-xl p-3 flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm"
                style={{
                  background: scoreColor(report.scores.overall) + '22',
                  color: scoreColor(report.scores.overall),
                }}
              >
                {report.scores.overall}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{report.input.query}</div>
                <div className="text-[10px] text-muted-foreground">
                  {report.connectors.filter((c) => c.status === 'found').length} sources · {report.durationMs / 1000 | 0}s scan
                </div>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs shrink-0">
                {new Date(report.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function SocialButton({
  href,
  icon: Icon,
  label,
  color,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  color: string
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <a
      href={href}
      target={onClick ? undefined : '_blank'}
      rel="noreferrer"
      onClick={onClick}
      className="group flex flex-col items-center gap-1.5 p-3 rounded-xl glass hover:glow transition-all hover:-translate-y-0.5"
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: color + '18', color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </a>
  )
}

function scoreColor(score: number) {
  if (score >= 75) return 'oklch(0.72 0.19 165)'
  if (score >= 55) return 'oklch(0.78 0.16 85)'
  if (score >= 35) return 'oklch(0.78 0.17 70)'
  return 'oklch(0.68 0.22 25)'
}

/** Convert a DigitalIdentityReport to a readable Markdown document. */
function reportToMarkdown(report: DigitalIdentityReport, includeScores: boolean): string {
  const lines: string[] = []
  const g = report.github
  const w = report.website
  const e = report.email
  const ai = report.aiReport

  lines.push(`# Digital Identity Report: ${report.input.query}`)
  lines.push('')
  lines.push(`> Generated by IdentityScope AI · ${new Date(report.createdAt).toISOString()}`)
  lines.push(`> Privacy-first: only public APIs used. No private data accessed.`)
  lines.push('')

  if (includeScores) {
    lines.push('## Scores')
    lines.push('')
    lines.push('| Dimension | Score |')
    lines.push('|-----------|-------|')
    const s = report.scores
    lines.push(`| **Overall** | **${s.overall}/100** |`)
    lines.push(`| Developer | ${s.developer}/100 |`)
    lines.push(`| Portfolio | ${s.portfolio}/100 |`)
    lines.push(`| Open Source | ${s.openSource}/100 |`)
    lines.push(`| Repository | ${s.repository}/100 |`)
    lines.push(`| Documentation | ${s.documentation}/100 |`)
    lines.push(`| Consistency | ${s.consistency}/100 |`)
    lines.push(`| Security | ${s.security}/100 |`)
    lines.push(`| Community | ${s.community}/100 |`)
    lines.push(`| Brand | ${s.brand}/100 |`)
    lines.push('')
  }

  if (g) {
    lines.push('## GitHub Analysis')
    lines.push('')
    lines.push(`- **User**: [@${g.user.login}](${g.user.htmlUrl})${g.user.name ? ` (${g.user.name})` : ''}`)
    if (g.user.bio) lines.push(`- **Bio**: ${g.user.bio}`)
    lines.push(`- **Followers**: ${g.user.followers.toLocaleString()}`)
    lines.push(`- **Public repos**: ${g.user.publicRepos}`)
    lines.push(`- **Total stars**: ${g.totalStars.toLocaleString()}`)
    lines.push(`- **Total forks**: ${g.totalForks.toLocaleString()}`)
    if (g.contributionYearTotal > 0) {
      lines.push(`- **Contributions (last year)**: ${g.contributionYearTotal.toLocaleString()}`)
      lines.push(`- **Active days**: ${g.contributionActiveDays}`)
    }
    if (g.languages.length > 0) {
      lines.push(`- **Top languages**: ${g.languages.slice(0, 5).map((l) => `${l.language} (${l.percentage}%)`).join(', ')}`)
    }
    if (g.bestProject) {
      lines.push(`- **Best project**: [${g.bestProject.name}](${g.bestProject.url}) ⭐ ${g.bestProject.stars} · score ${g.bestProject.score}/100`)
    }
    lines.push('')
  }

  if (w) {
    lines.push('## Website Analysis')
    lines.push('')
    lines.push(`- **URL**: ${w.url}`)
    lines.push(`- **HTTPS**: ${w.https ? '✅' : '❌'}`)
    lines.push(`- **Responsive**: ${w.responsive ? '✅' : '❌'}`)
    lines.push(`- **Performance**: ${w.performance}/100`)
    lines.push(`- **SEO**: ${w.seo}/100`)
    lines.push(`- **Accessibility**: ${w.accessibility}/100`)
    if (w.technologies.length > 0) {
      lines.push(`- **Technologies**: ${w.technologies.join(', ')}`)
    }
    lines.push('')
  }

  if (e) {
    lines.push('## Email Validation')
    lines.push('')
    lines.push(`- **Email**: ${e.email}`)
    lines.push(`- **Valid format**: ${e.format ? '✅' : '❌'}`)
    lines.push(`- **MX record**: ${e.mxRecord ? '✅' : '❌'}`)
    lines.push(`- **Disposable**: ${e.disposable ? '⚠️' : '✅ No'}`)
    lines.push(`- **Deliverability**: ${e.deliverability}`)
    lines.push('')
  }

  const foundSocial = report.social.filter((s) => s.found)
  if (foundSocial.length > 0) {
    lines.push('## Social Discovery')
    lines.push('')
    for (const s of foundSocial) {
      lines.push(`- **${s.platform}**: [@${s.handle}](${s.url})${s.followers ? ` · ${s.followers.toLocaleString()} followers` : ''}`)
    }
    lines.push('')
  }

  if (ai) {
    lines.push('## AI Report')
    lines.push('')
    lines.push(`**Developer Level**: ${ai.developerLevel}`)
    lines.push('')
    lines.push('### Executive Summary')
    lines.push(ai.executiveSummary)
    lines.push('')
    if (ai.strengths.length > 0) {
      lines.push('### Strengths')
      for (const s of ai.strengths) lines.push(`- ${s}`)
      lines.push('')
    }
    if (ai.weaknesses.length > 0) {
      lines.push('### Weaknesses')
      for (const s of ai.weaknesses) lines.push(`- ${s}`)
      lines.push('')
    }
    if (ai.learningRoadmap.length > 0) {
      lines.push('### Learning Roadmap')
      for (const phase of ai.learningRoadmap) {
        lines.push(`#### ${phase.phase}`)
        for (const item of phase.items) lines.push(`- ${item}`)
        lines.push('')
      }
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('*This report was generated by [IdentityScope AI](https://github.com) using only public APIs. No private accounts were accessed.*')

  return lines.join('\n')
}
