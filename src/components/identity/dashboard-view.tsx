'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Github,
  Globe,
  Mail,
  Users,
  Star,
  GitFork,
  BookOpen,
  Trophy,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Building2,
  Link as LinkIcon,
  Calendar,
  Code2,
  Activity,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Zap,
  Search,
  Accessibility,
  Package,
  TrendingUp,
  Award,
  Flame,
  Bookmark,
  Share2,
  Printer,
  RefreshCw,
  Brain,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/stores/app-store'
import { useAiReport, useScan } from '@/hooks/use-scan'
import { DashboardSkeleton } from '@/components/identity/skeletons'
import {
  ScoreRadar,
  LanguagePie,
  RepoBarChart,
  CommitActivityChart,
  ContributionHeatmap,
} from '@/components/charts'
import { AnimatedCounter, ProgressRing, Reveal, scoreColor, scoreLabel } from '@/components/charts/animated'
import type { DigitalIdentityReport, ScoreSet } from '@/lib/types'
import { toast } from 'sonner'

const SCORE_META: { key: keyof ScoreSet; label: string; icon: React.ElementType }[] = [
  { key: 'developer', label: 'Developer', icon: Code2 },
  { key: 'portfolio', label: 'Portfolio', icon: Globe },
  { key: 'openSource', label: 'Open Source', icon: Package },
  { key: 'repository', label: 'Repository', icon: Github },
  { key: 'documentation', label: 'Documentation', icon: BookOpen },
  { key: 'consistency', label: 'Consistency', icon: Activity },
  { key: 'security', label: 'Security', icon: ShieldCheck },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'brand', label: 'Brand', icon: Award },
]

const SCORE_DESCRIPTIONS: Record<keyof ScoreSet, string> = {
  developer: 'Composite of GitHub followers, repos, stars, account age & cross-platform presence.',
  portfolio: 'Website performance, SEO, accessibility, HTTPS, responsiveness & tech stack.',
  openSource: 'Public repos, forks (reusability), licensed projects, notable repos & contribution consistency.',
  repository: 'Average health & quality score across the user\'s top repositories.',
  documentation: 'README quality, completeness, presence of docs across repositories.',
  consistency: 'Contribution frequency and trend stability over the last 12 months.',
  security: 'Website HTTPS, security headers & email deliverability signals.',
  community: 'Followers, stars, social reach and platform presence across the internet.',
  brand: 'Profile completeness, bio, avatar, consistent handle & professional links.',
  overall: 'Weighted combination of all nine dimensions.',
}

export function DashboardView() {
  const { currentReport: report, setView, setCurrentReport } = useAppStore()
  const aiReport = useAiReport()
  const scan = useScan()

  // Show skeleton while a scan is in progress and no report yet
  if (scan.isPending && !report) {
    return <DashboardSkeleton />
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <div className="glass rounded-3xl p-10">
          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No report yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Run a scan to see your full digital identity dashboard.
          </p>
          <Button onClick={() => setView('scanner')}>Start a scan</Button>
        </div>
      </div>
    )
  }

  const g = report.github
  const w = report.website
  const e = report.email
  const scores = report.scores

  function handleShare() {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => toast.success('Report link copied'))
  }

  function handlePrint() {
    window.print()
  }

  function handleRegenerateAi() {
    aiReport.mutate(report, {
      onSuccess: (ai) => {
        const updated = { ...report, aiReport: ai }
        setCurrentReport(updated)
        toast.success('AI report regenerated with Gemini')
      },
    })
  }

  function handleBookmark() {
    toast.success('Report bookmarked — find it in the Bookmarks tab')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Header bar */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="capitalize">{report.input.type}</span>
              <span>·</span>
              <span>{new Date(report.createdAt).toLocaleString()}</span>
              <span>·</span>
              <span>{(report.durationMs / 1000).toFixed(1)}s</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 flex-wrap">
              {g ? (
                <Avatar className="h-9 w-9 border-2 border-primary/30">
                  <AvatarImage src={g.user.avatarUrl} alt={g.user.login} />
                  <AvatarFallback>{g.user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : null}
              <span className="font-mono">{report.input.query}</span>
              <Badge variant="secondary" className="text-xs">{scoreLabel(scores.overall)}</Badge>
            </h1>
          </div>
          <div className="flex items-center gap-2 no-print">
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Bookmark className="h-3.5 w-3.5 mr-1.5" /> Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1.5" /> PDF
            </Button>
            <Button size="sm" onClick={() => setView('report')}>
              <Brain className="h-3.5 w-3.5 mr-1.5" /> AI Report
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Top scores row */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Overall ring */}
          <Card className="glass p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Overall Score</div>
              <ProgressRing value={scores.overall} size={160} stroke={12} label="out of 100" />
              <div className="mt-3 text-sm font-semibold" style={{ color: scoreColor(scores.overall) }}>
                {scoreLabel(scores.overall)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {report.aiReport?.developerLevel ?? ''}
              </div>
            </div>
          </Card>

          {/* Radar */}
          <Card className="glass p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Score breakdown
              </h3>
              <Badge variant="outline" className="text-xs">9 dimensions</Badge>
            </div>
            <ScoreRadar scores={scores} />
          </Card>
        </div>
      </Reveal>

      {/* Score grid */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <TooltipProvider delayDuration={200}>
            {SCORE_META.map((s) => {
              const v = scores[s.key]
              const color = scoreColor(v)
              return (
                <Tooltip key={s.key}>
                  <TooltipTrigger asChild>
                    <Card className="glass p-4 hover:glow transition-all cursor-default relative overflow-hidden">
                      <div
                        className="absolute inset-x-0 top-0 h-0.5"
                        style={{ background: color, opacity: 0.7 }}
                      />
                      <div className="flex items-center justify-between mb-2">
                        <s.icon className="h-4 w-4" style={{ color }} />
                        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
                          <AnimatedCounter value={v} />
                        </span>
                      </div>
                      <div className="text-xs font-medium mb-1.5">{s.label}</div>
                      <Progress value={v} className="h-1.5" style={{ background: `${color}22` }} />
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <div className="text-xs">
                      <div className="font-semibold mb-0.5">{s.label} · {v}/100</div>
                      <div className="text-muted-foreground">{SCORE_DESCRIPTIONS[s.key]}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>
      </Reveal>

      {/* Quick insights banner */}
      <Reveal delay={0.12}>
        <QuickInsights report={report} />
      </Reveal>

      {/* Main content tabs */}
      <Tabs defaultValue="github" className="space-y-4">
        <TabsList className="glass p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="github" className="gap-1.5">
            <Github className="h-3.5 w-3.5" /> GitHub
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Portfolio
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Social
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email
          </TabsTrigger>
          <TabsTrigger value="connectors" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Connectors
          </TabsTrigger>
        </TabsList>

        {/* GitHub tab */}
        <TabsContent value="github" className="space-y-4">
          {g ? <GitHubSection g={g} /> : (
            <EmptyState icon={Github} title="No GitHub data" desc="Add a GitHub handle to see deep analysis." />
          )}
        </TabsContent>

        {/* Portfolio tab */}
        <TabsContent value="portfolio" className="space-y-4">
          {w ? <PortfolioSection w={w} /> : (
            <EmptyState icon={Globe} title="No website analyzed" desc="Add a website URL to analyze performance, SEO, security." />
          )}
        </TabsContent>

        {/* Social tab */}
        <TabsContent value="social" className="space-y-4">
          <SocialSection social={report.social} codeforces={report.codeforces} npm={report.npm} pypi={report.pypi} />
        </TabsContent>

        {/* Email tab */}
        <TabsContent value="email" className="space-y-4">
          {e ? <EmailSection e={e} /> : (
            <EmptyState icon={Mail} title="No email analyzed" desc="Add an email to validate format, MX records and deliverability." />
          )}
        </TabsContent>

        {/* Connectors tab */}
        <TabsContent value="connectors" className="space-y-4">
          <ConnectorsSection report={report} />
        </TabsContent>
      </Tabs>

      {/* AI CTA */}
      <Reveal delay={0.15}>
        <Card className="glass-strong p-6 mt-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[oklch(0.7_0.25_305/0.1)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.7_0.25_305)] flex items-center justify-center shrink-0">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Identity Report</h3>
                <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
                  Generate a full executive summary with strengths, weaknesses, career suggestions and a learning roadmap.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRegenerateAi} disabled={aiReport.isPending}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${aiReport.isPending ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button size="sm" onClick={() => setView('report')}>
                View report →
              </Button>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}

/* ----------------------------- GitHub ----------------------------- */

function GitHubSection({ g }: { g: NonNullable<DigitalIdentityReport['github']> }) {
  return (
    <div className="space-y-4">
      {/* Profile card */}
      <Reveal>
        <Card className="glass p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/30 shrink-0">
              <AvatarImage src={g.user.avatarUrl} alt={g.user.login} />
              <AvatarFallback className="text-xl">{g.user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold">{g.user.name || g.user.login}</h3>
                <a href={g.user.htmlUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {g.user.hireable && <Badge className="text-xs gap-1"><Flame className="h-3 w-3" /> Hireable</Badge>}
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">@{g.user.login}</p>
              {g.user.bio && <p className="text-sm mt-2 text-foreground/90">{g.user.bio}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-3">
                {g.user.company && (
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {g.user.company}</span>
                )}
                {g.user.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {g.user.location}</span>
                )}
                {g.user.blog && (
                  <a href={g.user.blog.startsWith('http') ? g.user.blog : `https://${g.user.blog}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                    <LinkIcon className="h-3 w-3" /> {g.user.blog}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined {new Date(g.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </span>
              </div>
              {/* social links */}
              {g.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {g.socialLinks.map((sl) => (
                    <a key={sl.platform} href={sl.url} target="_blank" rel="noreferrer">
                      <Badge variant="secondary" className="text-xs gap-1 hover:bg-accent">
                        <LinkIcon className="h-3 w-3" /> {sl.platform}
                      </Badge>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* stats */}
            <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 sm:border-l sm:border-border/40 sm:pl-5">
              {[
                { icon: Users, label: 'Followers', value: g.user.followers },
                { icon: UserFollowing, label: 'Following', value: g.user.following },
                { icon: BookOpen, label: 'Repos', value: g.user.publicRepos },
              ].map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <div className="text-xl font-bold tabular-nums">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                    <s.icon className="h-3 w-3" /> {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Star} label="Total stars" value={g.totalStars} color="oklch(0.78 0.17 85)" />
        <StatCard icon={GitFork} label="Total forks" value={g.totalForks} color="oklch(0.7 0.25 305)" />
        <StatCard icon={BookOpen} label="README quality" value={g.readmeQuality} suffix="/100" color="oklch(0.72 0.19 165)" />
        <StatCard icon={AlertTriangle} label="Inactive projects" value={g.inactiveProjects.length} color="oklch(0.7 0.19 22)" />
      </div>

      {/* Languages + repos chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" /> Top languages
          </h4>
          {g.languages.length > 0 ? (
            <>
              <LanguagePie languages={g.languages} />
              <div className="flex flex-wrap gap-2 mt-2">
                {g.languages.slice(0, 8).map((l) => (
                  <span key={l.language} className="inline-flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
                    {l.language} <span className="text-muted-foreground">{l.percentage}%</span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No language data</p>
          )}
        </Card>
        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Top repositories
          </h4>
          <RepoBarChart repos={g.repos} />
        </Card>
      </div>

      {/* Contribution heatmap */}
      <Card className="glass p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Contribution activity (last 12 months)
          </h4>
          {g.contributionYearTotal > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-bold tabular-nums">
                  <AnimatedCounter value={g.contributionYearTotal} />
                </span>
                <span className="text-muted-foreground">contributions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="font-bold tabular-nums">
                  <AnimatedCounter value={g.contributionActiveDays} />
                </span>
                <span className="text-muted-foreground">active days</span>
              </span>
            </div>
          )}
        </div>
        <ContributionHeatmap weeks={g.contributionWeeks} />
        <div className="mt-4 pt-4 border-t border-border/40">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Commit activity trend</h5>
          <CommitActivityChart data={g.commitActivity} />
        </div>
      </Card>

      {/* Best / worst */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {g.bestProject && <RepoCard label="Best project" icon={Trophy} color="oklch(0.78 0.17 85)" repo={g.bestProject} />}
        {g.worstProject && <RepoCard label="Needs attention" icon={AlertTriangle} color="oklch(0.7 0.19 22)" repo={g.worstProject} />}
      </div>

      {/* Pinned repos */}
      {g.pinnedRepos.length > 0 && (
        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Top repositories
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {g.pinnedRepos.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="group glass rounded-xl p-4 hover:glow transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate group-hover:text-primary">{r.name}</div>
                    {r.language && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: langColorFor(r.language) }} />
                        {r.language}
                      </div>
                    )}
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </div>
                {r.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {r.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {r.forks}</span>
                  <span className="ml-auto font-medium" style={{ color: scoreColor(r.score) }}>{r.score}</span>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Inactive projects */}
      {g.inactiveProjects.length > 0 && (
        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Inactive projects (no push in 1yr+)
          </h4>
          <div className="space-y-2">
            {g.inactiveProjects.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 text-sm hover:bg-accent/50 rounded-lg px-3 py-2">
                <span className="font-mono truncate">{r.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  Last push {new Date(r.pushedAt).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function UserFollowing({ className }: { className?: string }) {
  return <Users className={className} />
}

function langColorFor(lang: string) {
  const map: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
    PHP: '#4F5D95', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
    Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883',
    Svelte: '#ff3e00', Kotlin: '#A97BFF', Swift: '#F05138', Dart: '#00B4AB',
  }
  return map[lang] ?? '#8b949e'
}

/* ----------------------------- Portfolio ----------------------------- */

function PortfolioSection({ w }: { w: NonNullable<DigitalIdentityReport['website']> }) {
  const goodHeaders = w.securityHeaders.filter((h) => h.present && h.severity === 'good').length
  const totalGood = w.securityHeaders.filter((h) => h.severity === 'good').length
  return (
    <div className="space-y-4">
      <Reveal>
        <Card className="glass p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary shrink-0" />
                <a href={w.finalUrl} target="_blank" rel="noreferrer" className="font-semibold hover:text-primary truncate">
                  {w.title || w.url}
                </a>
                {w.https ? (
                  <Badge variant="secondary" className="text-xs gap-1 text-emerald-500">
                    <ShieldCheck className="h-3 w-3" /> HTTPS
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1 text-red-500">
                    <ShieldX className="h-3 w-3" /> No HTTPS
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1 truncate">{w.finalUrl}</p>
              {w.description && <p className="text-sm text-muted-foreground mt-2">{w.description}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {w.technologies.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
                {w.responsive && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Smartphone className="h-3 w-3" /> Responsive
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <ProgressRing value={w.score} size={110} stroke={10} label="website" />
            </div>
          </div>
        </Card>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ScoreMini icon={Zap} label="Performance" value={w.performance} color="oklch(0.78 0.17 85)" />
        <ScoreMini icon={Search} label="SEO" value={w.seo} color="oklch(0.72 0.19 265)" />
        <ScoreMini icon={Accessibility} label="Accessibility" value={w.accessibility} color="oklch(0.76 0.17 165)" />
        <ScoreMini icon={ShieldCheck} label="Security" value={Math.round((goodHeaders / totalGood) * 100)} color="oklch(0.7 0.25 305)" />
      </div>

      {/* Meta / OG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Meta & OpenGraph
          </h4>
          <dl className="space-y-2 text-sm">
            <MetaRow label="Title" value={w.title} />
            <MetaRow label="Description" value={w.description} />
            <MetaRow label="Language" value={w.language} />
            <MetaRow label="Favicon" value={w.favicon ? 'present' : 'missing'} />
            <MetaRow label="OG title" value={w.openGraph['og:title']} />
            <MetaRow label="OG description" value={w.openGraph['og:description']} />
            <MetaRow label="OG image" value={w.openGraph['og:image'] ? 'present' : undefined} />
            <MetaRow label="Page size" value={`${(w.pageSizeBytes / 1024).toFixed(1)} KB`} />
            <MetaRow label="Load time" value={`${w.loadTimeMs}ms`} />
          </dl>
        </Card>

        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Security headers
            <Badge variant="outline" className="text-xs ml-auto">
              {goodHeaders}/{totalGood} good
            </Badge>
          </h4>
          <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {w.securityHeaders.map((h) => (
              <div key={h.name} className="flex items-center justify-between gap-2 text-xs">
                <span className="font-mono truncate">{h.name}</span>
                {h.present ? (
                  h.severity === 'good' ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : h.severity === 'warning' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <ShieldX className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )
                ) : (
                  <span className="text-muted-foreground/50 text-[10px]">missing</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm flex-1 break-words">{value ?? <span className="text-muted-foreground/50">—</span>}</dd>
    </div>
  )
}

/* ----------------------------- Social ----------------------------- */

function SocialSection({
  social,
  codeforces,
  npm,
  pypi,
}: {
  social: DigitalIdentityReport['social']
  codeforces: DigitalIdentityReport['codeforces']
  npm: DigitalIdentityReport['npm']
  pypi: DigitalIdentityReport['pypi']
}) {
  const platformIcons: Record<string, React.ElementType> = {
    GitHub: Github,
    Reddit: Users,
    'Dev.to': Code2,
    Hashnode: BookOpen,
    Medium: BookOpen,
    Kaggle: Trophy,
    'Stack Overflow': Search,
    'Hacker News': Flame,
    GitLab: GitFork,
  }
  const foundCount = social.filter((s) => s.found).length

  return (
    <div className="space-y-4">
      <Reveal>
        <Card className="glass p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Social discovery
            </h3>
            <Badge variant="secondary" className="text-xs">
              <AnimatedCounter value={foundCount} /> / {social.length} platforms
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Probed across public endpoints. Only public profiles are shown.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {social.map((s) => {
              const Icon = platformIcons[s.platform] ?? Globe
              return (
                <a
                  key={s.platform}
                  href={s.url ?? '#'}
                  target={s.url ? '_blank' : undefined}
                  rel="noreferrer"
                  className={`group glass rounded-xl p-4 transition-all hover:-translate-y-0.5 ${
                    s.found ? 'hover:glow' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.found ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{s.platform}</div>
                        <div className="text-xs text-muted-foreground font-mono">@{s.handle}</div>
                      </div>
                    </div>
                    {s.found ? (
                      <Badge variant="secondary" className="text-xs text-emerald-500 gap-1">
                        <ShieldCheck className="h-3 w-3" /> Found
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Not found</Badge>
                    )}
                  </div>
                  {s.found && (
                    <div className="grid grid-cols-3 gap-2 text-center mt-2 pt-2 border-t border-border/40">
                      {s.followers != null && (
                        <div>
                          <div className="text-sm font-bold tabular-nums">
                            {s.followers > 999 ? `${(s.followers / 1000).toFixed(1)}k` : s.followers}
                          </div>
                          <div className="text-[9px] uppercase text-muted-foreground">Followers</div>
                        </div>
                      )}
                      {s.following != null && (
                        <div>
                          <div className="text-sm font-bold tabular-nums">{s.following}</div>
                          <div className="text-[9px] uppercase text-muted-foreground">Following</div>
                        </div>
                      )}
                      {s.posts != null && (
                        <div>
                          <div className="text-sm font-bold tabular-nums">{s.posts}</div>
                          <div className="text-[9px] uppercase text-muted-foreground">Posts</div>
                        </div>
                      )}
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        </Card>
      </Reveal>

      {/* Codeforces + Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {codeforces && (
          <Card className="glass p-5">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Codeforces
            </h4>
            {codeforces.found ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono">{codeforces.handle}</span>
                  <Badge variant="secondary" className="text-xs capitalize">{codeforces.rank ?? 'unrated'}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="glass rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold tabular-nums">{codeforces.rating ?? '—'}</div>
                    <div className="text-[10px] text-muted-foreground">Current rating</div>
                  </div>
                  <div className="glass rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold tabular-nums">{codeforces.maxRating ?? '—'}</div>
                    <div className="text-[10px] text-muted-foreground">Max rating</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Contribution: {codeforces.contribution} · Friends: {codeforces.friendOfCount}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No Codeforces profile found for this handle.</p>
            )}
          </Card>
        )}

        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> NPM packages
          </h4>
          {npm && npm.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
              {npm.slice(0, 6).map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="block hover:bg-accent/50 rounded px-2 py-1.5">
                  <div className="text-sm font-mono truncate">{p.name}</div>
                  {p.description && <div className="text-xs text-muted-foreground truncate">{p.description}</div>}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No NPM packages found.</p>
          )}
        </Card>

        <Card className="glass p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> PyPI packages
          </h4>
          {pypi && pypi.length > 0 ? (
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
              {pypi.slice(0, 6).map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="block hover:bg-accent/50 rounded px-2 py-1.5">
                  <div className="text-sm font-mono truncate">{p.name}</div>
                  {p.description && <div className="text-xs text-muted-foreground truncate">{p.description}</div>}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No PyPI packages found.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ----------------------------- Email ----------------------------- */

function EmailSection({ e }: { e: NonNullable<DigitalIdentityReport['email']> }) {
  const checks = [
    { label: 'Valid format', ok: e.format, icon: e.format ? ShieldCheck : ShieldX },
    { label: 'MX record exists', ok: e.mxRecord, icon: e.mxRecord ? ShieldCheck : ShieldX },
    { label: 'Not disposable', ok: !e.disposable, icon: !e.disposable ? ShieldCheck : ShieldX },
    { label: 'Deliverable', ok: e.valid, icon: e.valid ? ShieldCheck : ShieldX },
  ]
  return (
    <Reveal>
      <Card className="glass p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{e.email}</h3>
            <p className="text-xs text-muted-foreground">Deliverability: <span className="capitalize font-medium" style={{ color: e.deliverability === 'high' ? 'oklch(0.72 0.19 165)' : e.deliverability === 'low' ? 'oklch(0.7 0.19 22)' : undefined }}>{e.deliverability}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {checks.map((c) => (
            <div key={c.label} className="glass rounded-xl p-3 text-center">
              <c.icon className={`h-5 w-5 mx-auto mb-1.5 ${c.ok ? 'text-emerald-500' : 'text-red-500'}`} />
              <div className="text-xs font-medium">{c.label}</div>
              <div className={`text-[10px] mt-0.5 ${c.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                {c.ok ? 'Passed' : 'Failed'}
              </div>
            </div>
          ))}
        </div>
        {e.suggestions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Suggestions</h4>
            <ul className="space-y-1 text-sm">
              {e.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          MX records checked via public Cloudflare DNS-over-HTTPS. No SMTP ping, no third-party API.
        </div>
      </Card>
    </Reveal>
  )
}

/* ----------------------------- Connectors ----------------------------- */

function ConnectorsSection({ report }: { report: DigitalIdentityReport }) {
  return (
    <Card className="glass p-5">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" /> Connector results
      </h4>
      <div className="space-y-2">
        {report.connectors.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 glass rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                c.status === 'found' ? 'bg-emerald-500/15 text-emerald-500' :
                c.status === 'not_found' ? 'bg-muted text-muted-foreground' :
                'bg-red-500/15 text-red-500'
              }`}>
                {c.status === 'found' ? <ShieldCheck className="h-4 w-4" /> :
                 c.status === 'not_found' ? <Search className="h-4 w-4" /> :
                 <AlertTriangle className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{c.name}</div>
                {c.error && <div className="text-xs text-red-500 truncate">{c.error}</div>}
                {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary truncate block font-mono">{c.url}</a>}
              </div>
            </div>
            <Badge variant="outline" className="text-xs capitalize shrink-0">{c.status.replace('_', ' ')}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ----------------------------- Shared ----------------------------- */

function StatCard({ icon: Icon, label, value, suffix, color }: { icon: React.ElementType; label: string; value: number; suffix?: string; color: string }) {
  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between mb-1">
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  )
}

function ScoreMini({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-xl font-bold tabular-nums" style={{ color }}>
          <AnimatedCounter value={value} />
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <Progress value={value} className="h-1.5" style={{ background: `${color}22` }} />
    </Card>
  )
}

function RepoCard({ label, icon: Icon, color, repo }: { label: string; icon: React.ElementType; color: string; repo: { name: string; url: string; description: string | null; stars: number; forks: number; score: number; language: string | null; readmeQuality: number; health: number } }) {
  return (
    <Card className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
        </div>
        <Badge variant="secondary" className="text-xs" style={{ color }}>{repo.score}/100</Badge>
      </div>
      <a href={repo.url} target="_blank" rel="noreferrer" className="block hover:text-primary">
        <div className="font-semibold text-sm font-mono">{repo.name}</div>
      </a>
      {repo.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stars}</span>
        <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {repo.forks}</span>
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: langColorFor(repo.language) }} />
            {repo.language}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/40">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase">README</div>
          <Progress value={repo.readmeQuality} className="h-1 mt-1" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase">Health</div>
          <Progress value={repo.health} className="h-1 mt-1" />
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  const setView = useAppStore((s) => s.setView)
  return (
    <Card className="glass p-10 text-center">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      <Button size="sm" onClick={() => setView('scanner')}>Run a new scan</Button>
    </Card>
  )
}

/* ----------------------------- Quick Insights ----------------------------- */

interface Insight {
  type: 'positive' | 'warning' | 'negative' | 'info'
  icon: React.ElementType
  title: string
  detail: string
}

function QuickInsights({ report }: { report: DigitalIdentityReport }) {
  const insights: Insight[] = []
  const g = report.github
  const w = report.website
  const e = report.email
  const s = report.scores

  // GitHub insights
  if (g) {
    if (g.user.followers >= 1000) {
      insights.push({
        type: 'positive',
        icon: Users,
        title: `${formatCompact(g.user.followers)} GitHub followers`,
        detail: 'Strong developer network reach.',
      })
    }
    if (g.totalStars >= 100) {
      insights.push({
        type: 'positive',
        icon: Star,
        title: `${formatCompact(g.totalStars)} total stars`,
        detail: 'Open-source work is being noticed.',
      })
    }
    if (g.contributionActiveDays > 200) {
      insights.push({
        type: 'positive',
        icon: Flame,
        title: `${g.contributionActiveDays} active days this year`,
        detail: 'Highly consistent contribution streak.',
      })
    }
    if (g.readmeQuality < 40 && g.repos.length > 0) {
      insights.push({
        type: 'warning',
        icon: BookOpen,
        title: 'Low README quality',
        detail: `Average ${g.readmeQuality}/100 — documentation needs work.`,
      })
    }
    if (g.inactiveProjects.length > 2) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: `${g.inactiveProjects.length} inactive projects`,
        detail: 'Repos untouched for over a year — archive or revive.',
      })
    }
    if (!g.user.bio) {
      insights.push({
        type: 'negative',
        icon: AlertTriangle,
        title: 'Missing GitHub bio',
        detail: 'Add a bio to strengthen personal branding.',
      })
    }
    if (g.bestProject && g.bestProject.stars > 50) {
      insights.push({
        type: 'info',
        icon: Trophy,
        title: `Top repo: ${g.bestProject.name}`,
        detail: `${formatCompact(g.bestProject.stars)} stars, score ${g.bestProject.score}/100.`,
      })
    }
  }

  // Website insights
  if (w) {
    if (!w.https) {
      insights.push({
        type: 'negative',
        icon: ShieldX,
        title: 'Website not on HTTPS',
        detail: 'Security and SEO are both impacted.',
      })
    }
    if (!w.responsive) {
      insights.push({
        type: 'negative',
        icon: Smartphone,
        title: 'Website not mobile-responsive',
        detail: 'Poor mobile UX hurts SEO and accessibility.',
      })
    }
    if (w.performance < 60) {
      insights.push({
        type: 'warning',
        icon: Zap,
        title: 'Website performance needs work',
        detail: `Score ${w.performance}/100 — optimize assets & requests.`,
      })
    }
    if (w.technologies.length >= 3) {
      insights.push({
        type: 'info',
        icon: Code2,
        title: `${w.technologies.length} technologies detected`,
        detail: w.technologies.slice(0, 4).join(', '),
      })
    }
  }

  // Email insights
  if (e && !e.valid) {
    insights.push({
      type: 'warning',
      icon: Mail,
      title: 'Email deliverability concerns',
      detail: e.disposable ? 'Disposable domain.' : !e.mxRecord ? 'No MX records.' : 'Format issue.',
    })
  }

  // Score-based insights
  if (s.overall >= 75) {
    insights.push({
      type: 'positive',
      icon: Award,
      title: `Overall score ${s.overall}/100 — excellent`,
      detail: 'Top-tier digital identity across all dimensions.',
    })
  } else if (s.overall < 35) {
    insights.push({
      type: 'negative',
      icon: TrendingUp,
      title: `Overall score ${s.overall}/100 — needs work`,
      detail: 'Several dimensions need attention. See AI report for a roadmap.',
    })
  }

  // Social reach
  const foundSocial = report.social.filter((x) => x.found).length
  if (foundSocial >= 5) {
    insights.push({
      type: 'positive',
      icon: Users,
      title: `Present on ${foundSocial} platforms`,
      detail: 'Strong cross-platform identity consistency.',
    })
  } else if (foundSocial <= 1) {
    insights.push({
      type: 'warning',
      icon: Users,
      title: 'Limited social footprint',
      detail: `Only ${foundSocial} platform(s) found — expand your presence.`,
    })
  }

  if (insights.length === 0) {
    return null
  }

  const styleMap = {
    positive: { color: 'oklch(0.72 0.19 165)', bg: 'oklch(0.72 0.19 165 / 0.1)', border: 'oklch(0.72 0.19 165 / 0.3)' },
    warning: { color: 'oklch(0.78 0.17 85)', bg: 'oklch(0.78 0.17 85 / 0.1)', border: 'oklch(0.78 0.17 85 / 0.3)' },
    negative: { color: 'oklch(0.7 0.19 22)', bg: 'oklch(0.7 0.19 22 / 0.1)', border: 'oklch(0.7 0.19 22 / 0.3)' },
    info: { color: 'oklch(0.72 0.19 265)', bg: 'oklch(0.72 0.19 265 / 0.1)', border: 'oklch(0.72 0.19 265 / 0.3)' },
  }

  // Limit to 6 most important
  const display = insights.slice(0, 6)

  return (
    <Card className="glass-strong p-5 mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Quick insights</h3>
          <Badge variant="outline" className="text-xs ml-auto">{insights.length} signals</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {display.map((ins, i) => {
            const st = styleMap[ins.type]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl p-3 flex items-start gap-2.5"
                style={{ background: st.bg, border: `1px solid ${st.border}` }}
              >
                <ins.icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: st.color }} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-tight">{ins.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{ins.detail}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}
