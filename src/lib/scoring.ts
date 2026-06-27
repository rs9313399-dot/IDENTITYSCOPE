/**
 * Scoring engine — aggregates connector outputs into the unified ScoreSet.
 * Each score is 0-100 and computed from real, public signals.
 */

import type {
  AIReport,
  DigitalIdentityReport,
  GitHubAnalysis,
  WebsiteAnalysis,
  EmailAnalysis,
  ScoreSet,
  SocialProfile,
  CodeforcesProfile,
  PackageRegistryProfile,
} from '@/lib/types'

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function scoreDeveloper(github: GitHubAnalysis | null, social: SocialProfile[]): number {
  if (!github) return 0
  let score = 20
  // followers
  score += Math.min(25, Math.log10(Math.max(github.user.followers, 1) + 1) * 9)
  // repos
  score += Math.min(15, Math.log10(Math.max(github.user.publicRepos, 1) + 1) * 6)
  // stars
  score += Math.min(20, Math.log10(Math.max(github.totalStars, 1) + 1) * 6)
  // account age
  const ageYears = (Date.now() - new Date(github.user.createdAt).getTime()) / (365 * 86400000)
  score += Math.min(10, ageYears * 2)
  // social presence across platforms
  score += Math.min(10, social.filter((s) => s.found).length * 2)
  return clamp(score)
}

function scoreOpenSource(github: GitHubAnalysis | null): number {
  if (!github) return 0
  let score = 15
  // public repos
  score += Math.min(25, Math.log10(Math.max(github.user.publicRepos, 1) + 1) * 10)
  // forks (people building on the work)
  score += Math.min(20, Math.log10(Math.max(github.totalForks, 1) + 1) * 7)
  // licensed repos
  const licensed = github.repos.filter((r) => r.license).length
  score += Math.min(15, licensed * 3)
  // has a notable repo (stars > 50)
  const notable = github.repos.filter((r) => r.stars > 50).length
  score += Math.min(15, notable * 5)
  // contribution consistency
  const activeDays = github.contributionWeeks
    .flatMap((w) => w.days)
    .filter((d) => d.count > 0).length
  score += Math.min(10, (activeDays / 365) * 10)
  return clamp(score)
}

function scoreRepository(github: GitHubAnalysis | null): number {
  if (!github || github.repos.length === 0) return 0
  const avg = github.repos.reduce((a, r) => a + r.score, 0) / github.repos.length
  return clamp(avg)
}

function scoreDocumentation(github: GitHubAnalysis | null): number {
  if (!github || github.repos.length === 0) return 0
  let score = github.readmeQuality * 0.6
  const withReadme = github.repos.filter((r) => r.hasReadme).length
  score += (withReadme / github.repos.length) * 25
  const withWiki = github.repos.filter((r) => r.hasWiki).length
  score += (withWiki / github.repos.length) * 10
  const withPages = github.repos.filter((r) => r.hasPages).length
  score += (withPages / github.repos.length) * 5
  return clamp(score)
}

function scoreConsistency(github: GitHubAnalysis | null): number {
  if (!github) return 0
  const activeDays = github.contributionWeeks
    .flatMap((w) => w.days)
    .filter((d) => d.count > 0).length
  // active days / 365
  let score = (activeDays / 365) * 60
  // recently pushed
  const recentPush = github.repos.filter((r) => {
    const days = (Date.now() - new Date(r.pushedAt).getTime()) / 86400000
    return days < 90
  }).length
  score += Math.min(20, recentPush * 4)
  // commit activity trend (last 3 months vs previous)
  const activity = github.commitActivity
  if (activity.length >= 6) {
    const recent = activity.slice(-3).reduce((a, m) => a + m.commits, 0)
    const prev = activity.slice(-6, -3).reduce((a, m) => a + m.commits, 0)
    if (prev > 0) {
      const ratio = recent / prev
      score += Math.min(20, ratio * 10)
    } else if (recent > 0) {
      score += 15
    }
  }
  return clamp(score)
}

function scoreSecurity(
  website: WebsiteAnalysis | null,
  email: EmailAnalysis | null
): number {
  let score = 40
  if (website) {
    if (website.https) score += 15
    else score -= 15
    const goodHeaders = website.securityHeaders.filter(
      (h) => h.present && h.severity === 'good'
    ).length
    score += goodHeaders * 3
    const leakHeaders = website.securityHeaders.filter(
      (h) => h.present && h.severity === 'bad'
    ).length
    score -= leakHeaders * 5
  }
  if (email) {
    if (email.valid) score += 10
    else if (email.format) score += 4
    if (email.disposable) score -= 10
  }
  return clamp(score)
}

function scoreCommunity(github: GitHubAnalysis | null, social: SocialProfile[]): number {
  let score = 20
  if (github) {
    score += Math.min(25, Math.log10(Math.max(github.user.followers, 1) + 1) * 8)
    score += Math.min(15, Math.log10(Math.max(github.totalStars, 1) + 1) * 5)
  }
  const foundSocial = social.filter((s) => s.found)
  score += Math.min(20, foundSocial.length * 4)
  const totalReach = foundSocial.reduce((a, s) => a + (s.followers ?? 0), 0)
  score += Math.min(20, Math.log10(Math.max(totalReach, 1) + 1) * 4)
  return clamp(score)
}

function scoreBrand(
  github: GitHubAnalysis | null,
  website: WebsiteAnalysis | null,
  social: SocialProfile[]
): number {
  let score = 25
  if (github) {
    if (github.user.bio && github.user.bio.length > 30) score += 8
    if (github.user.name) score += 4
    if (github.user.blog) score += 6
    if (github.user.location) score += 3
    if (github.user.company) score += 4
    if (github.user.avatarUrl) score += 2
  }
  if (website) {
    if (website.reachable) score += 10
    if (website.https) score += 5
    if (website.title) score += 4
    if (website.openGraph['og:image']) score += 5
    if (website.favicon) score += 3
  }
  // consistent handle across platforms
  const handles = new Set(
    social.filter((s) => s.found).map((s) => s.handle?.toLowerCase())
  )
  score += Math.min(8, handles.size * 2)
  return clamp(score)
}

function scorePortfolio(website: WebsiteAnalysis | null, github: GitHubAnalysis | null): number {
  if (!website) return 0
  let score = 20
  score += website.performance * 0.2
  score += website.seo * 0.2
  score += website.accessibility * 0.15
  if (website.https) score += 8
  if (website.responsive) score += 12
  else score -= 10
  if (website.technologies.length > 0) score += 5
  score += Math.min(8, website.securityHeaders.filter((h) => h.present && h.severity === 'good').length * 1.5)
  if (github && github.user.blog) score += 4
  return clamp(score)
}

function scoreOverall(s: Omit<ScoreSet, 'overall'>): number {
  const weights: Record<keyof typeof s, number> = {
    developer: 0.16,
    portfolio: 0.12,
    openSource: 0.14,
    repository: 0.1,
    documentation: 0.1,
    consistency: 0.1,
    security: 0.08,
    community: 0.1,
    brand: 0.1,
  }
  const total = (Object.keys(weights) as (keyof typeof s)[]).reduce(
    (acc, k) => acc + s[k] * weights[k],
    0
  )
  return clamp(total)
}

export function computeScores(args: {
  github: GitHubAnalysis | null
  website: WebsiteAnalysis | null
  email: EmailAnalysis | null
  social: SocialProfile[]
  codeforces: CodeforcesProfile | null
  npm: PackageRegistryProfile[] | null
  pypi: PackageRegistryProfile[] | null
}): ScoreSet {
  const { github, website, email, social } = args
  const partial: Omit<ScoreSet, 'overall'> = {
    developer: scoreDeveloper(github, social),
    portfolio: scorePortfolio(website, github),
    openSource: scoreOpenSource(github),
    repository: scoreRepository(github),
    documentation: scoreDocumentation(github),
    consistency: scoreConsistency(github),
    security: scoreSecurity(website, email),
    community: scoreCommunity(github, social),
    brand: scoreBrand(github, website, social),
  }
  return { ...partial, overall: scoreOverall(partial) }
}

export function getDeveloperLevel(score: number): string {
  if (score >= 85) return 'Elite Engineer'
  if (score >= 70) return 'Senior Engineer'
  if (score >= 55) return 'Mid-level Engineer'
  if (score >= 40) return 'Junior Engineer'
  if (score >= 25) return 'Aspiring Developer'
  return 'Beginner'
}

export function summarizeForAI(report: DigitalIdentityReport): string {
  const g = report.github
  const w = report.website
  const e = report.email
  const s = report.scores
  const lines: string[] = []
  lines.push(`DIGITAL IDENTITY REPORT SUMMARY`)
  lines.push(`Overall score: ${s.overall}/100`)
  lines.push(`Developer: ${s.developer} | Portfolio: ${s.portfolio} | OpenSource: ${s.openSource} | Docs: ${s.documentation} | Consistency: ${s.consistency} | Security: ${s.security} | Community: ${s.community} | Brand: ${s.brand}`)
  if (g) {
    lines.push(`\nGITHUB: @${g.user.login} (${g.user.name ?? 'no name'})`)
    lines.push(`Bio: ${g.user.bio ?? 'none'}`)
    lines.push(`Followers: ${g.user.followers} | Following: ${g.user.following} | Public repos: ${g.user.publicRepos}`)
    lines.push(`Total stars: ${g.totalStars} | Total forks: ${g.totalForks}`)
    lines.push(`Top languages: ${g.languages.slice(0, 5).map((l) => `${l.language} ${l.percentage}%`).join(', ')}`)
    lines.push(`Best project: ${g.bestProject?.name ?? 'n/a'} (score ${g.bestProject?.score ?? 0}, ${g.bestProject?.stars ?? 0} stars)`)
    lines.push(`Worst project: ${g.worstProject?.name ?? 'n/a'} (score ${g.worstProject?.score ?? 0})`)
    lines.push(`Inactive projects (>1yr): ${g.inactiveProjects.length}`)
    lines.push(`README quality avg: ${g.readmeQuality}/100`)
    lines.push(`Account age: ${Math.round((Date.now() - new Date(g.user.createdAt).getTime()) / (365 * 86400000) * 10) / 10} years`)
    if (g.user.blog) lines.push(`Blog: ${g.user.blog}`)
    if (g.user.location) lines.push(`Location: ${g.user.location}`)
  }
  if (w) {
    lines.push(`\nWEBSITE: ${w.url}`)
    lines.push(`Reachable: ${w.reachable} | HTTPS: ${w.https} | Status: ${w.httpStatus}`)
    lines.push(`Title: ${w.title ?? 'none'}`)
    lines.push(`Performance: ${w.performance} | SEO: ${w.seo} | Accessibility: ${w.accessibility}`)
    lines.push(`Responsive: ${w.responsive} | Technologies: ${w.technologies.join(', ') || 'none detected'}`)
    lines.push(`Security headers present: ${w.securityHeaders.filter((h) => h.present && h.severity === 'good').length}/${w.securityHeaders.filter((h) => h.severity === 'good').length}`)
  }
  if (e) {
    lines.push(`\nEMAIL: ${e.email}`)
    lines.push(`Valid: ${e.valid} | Format: ${e.format} | MX: ${e.mxRecord} | Disposable: ${e.disposable} | Deliverability: ${e.deliverability}`)
  }
  lines.push(`\nSOCIAL DISCOVERY:`)
  for (const p of report.social) {
    lines.push(`- ${p.platform}: ${p.found ? `FOUND @${p.handle}` : 'not found'}${p.followers ? ` (${p.followers} followers)` : ''}`)
  }
  if (report.codeforces?.found) {
    lines.push(`\nCODEFORCES: ${report.codeforces.handle} | rating ${report.codeforces.rating ?? 'unrated'} (max ${report.codeforces.maxRating ?? '-'}) | rank ${report.codeforces.rank ?? '-'}`)
  }
  if (report.npm && report.npm.length > 0) {
    lines.push(`NPM packages: ${report.npm.length} (${report.npm.slice(0, 3).map((p) => p.name).join(', ')})`)
  }
  return lines.join('\n')
}

export function buildFallbackAIReport(report: DigitalIdentityReport): AIReport {
  const g = report.github
  const w = report.website
  const strengths: string[] = []
  const weaknesses: string[] = []
  const career: string[] = []
  const resume: string[] = []
  const portfolio: string[] = []
  const githubImp: string[] = []
  const roadmap: { phase: string; items: string[] }[] = []
  const oss: string[] = []

  if (g) {
    if (g.user.followers > 100) strengths.push(`Strong GitHub following (${g.user.followers} followers)`)
    if (g.totalStars > 50) strengths.push(`Open-source traction with ${g.totalStars} total stars`)
    if (g.readmeQuality > 60) strengths.push(`Good documentation culture (README quality ${g.readmeQuality}/100)`)
    if (g.languages.length >= 3) strengths.push(`Polyglot: ${g.languages.slice(0, 3).map((l) => l.language).join(', ')}`)
    if (g.user.publicRepos > 10) strengths.push(`Active creator with ${g.user.publicRepos} public repositories`)

    if (g.readmeQuality < 40) weaknesses.push(`README quality is low (${g.readmeQuality}/100) — many repos lack documentation`)
    if (g.inactiveProjects.length > 3) weaknesses.push(`${g.inactiveProjects.length} inactive projects (no push in over a year)`)
    if (g.user.bio === null || g.user.bio.length < 20) weaknesses.push('GitHub bio is missing or too short — weak personal branding')
    if (g.user.blog === null) weaknesses.push('No personal website linked on GitHub')
    if (g.repos.filter((r) => r.license).length < g.repos.length / 2) weaknesses.push('Many repositories lack a license file')
  }
  if (w) {
    if (w.https) strengths.push(`Website uses HTTPS`)
    if (w.responsive) strengths.push(`Website is mobile responsive`)
    if (w.seo > 60) strengths.push(`Good SEO fundamentals (score ${w.seo}/100)`)
    if (w.performance < 60) weaknesses.push(`Website performance is sub-optimal (${w.performance}/100)`)
    if (!w.responsive) weaknesses.push('Website is not mobile responsive')
    const leakHeaders = w.securityHeaders.filter((h) => h.present && h.severity === 'bad')
    if (leakHeaders.length > 0) weaknesses.push(`Server leaks info via ${leakHeaders.map((h) => h.name).join(', ')}`)
  }
  if (report.email && !report.email.valid) {
    weaknesses.push(`Email ${report.email.email} has deliverability concerns`)
  }

  career.push(`Target roles aligned with your strongest languages: ${g?.languages.slice(0, 2).map((l) => l.language).join(' & ') ?? 'JavaScript/TypeScript'}.`)
  career.push(`Build a case-study around your best project (${g?.bestProject?.name ?? 'your top repo'}) for interviews.`)
  career.push(`Contribute to 2-3 established open-source projects in your stack to grow visibility.`)
  resume.push(`Add a quantified GitHub stats line: "${g?.user.followers ?? 0} followers, ${g?.totalStars ?? 0} stars across ${g?.user.publicRepos ?? 0} repos".`)
  resume.push(`Link your top 3 repositories with one-line impact descriptions.`)
  resume.push(`Include your Codeforces rating if competitive programming is a strength.`)
  portfolio.push(w ? `Improve your website performance — currently ${w.performance}/100.` : `Launch a personal website to showcase your projects.`)
  portfolio.push(`Add a projects section with screenshots, live demos and source links.`)
  portfolio.push(`Make sure your site has Open Graph tags for better social sharing.`)
  githubImp.push(`Fill out your GitHub profile README with a bio, social links and pinned repos.`)
  githubImp.push(`Add LICENSE files to all public repositories.`)
  githubImp.push(`Archive or refresh inactive projects: ${g?.inactiveProjects.length ?? 0} repos untouched for over a year.`)
  githubImp.push(`Enable GitHub Discussions on your most popular repos to build community.`)
  roadmap.push({
    phase: 'Phase 1 (Weeks 1-2): Foundations',
    items: [
      'Polish your GitHub profile (bio, avatar, social links, README).',
      'Add LICENSE + README to every public repo.',
      'Set up a personal website if you don\'t have one.',
    ],
  })
  roadmap.push({
    phase: 'Phase 2 (Weeks 3-6): Strengthen',
    items: [
      'Improve documentation on your top 3 repos (badges, screenshots, examples).',
      'Fix website performance and SEO issues.',
      'Pick one inactive project and either revive or archive it.',
    ],
  })
  roadmap.push({
    phase: 'Phase 3 (Weeks 7-12): Grow',
    items: [
      'Open-source one of your internal tools with a clear README and contributing guide.',
      'Write 3 technical blog posts on Dev.to or Hashnode.',
      'Make 5 substantive contributions to external OSS projects.',
    ],
  })
  oss.push(`Convert your most-starred repo (${g?.bestProject?.name ?? 'top project'}) into a maintained OSS project with issues templates and a roadmap.`)
  oss.push(`Publish a reusable library to NPM or PyPI based on code you already wrote.`)
  oss.push(`Mentor a newcomer by labeling "good first issue" tickets on your repos.`)

  const level = getDeveloperLevel(report.scores.overall)
  const executiveSummary = `This digital identity report analyzes public signals across GitHub${w ? ', the personal website' : ''}${report.email ? ', email deliverability' : ''} and ${report.social.filter((s) => s.found).length} social platforms. ${g ? `@${g.user.login} operates as a ${level.toLowerCase()} with ${g.user.followers} followers and ${g.totalStars} total stars.` : ''} The overall digital identity score is ${report.scores.overall}/100, reflecting ${report.scores.overall >= 70 ? 'a strong, well-rounded developer brand' : report.scores.overall >= 45 ? 'a solid foundation with clear room to grow' : 'an early-stage identity that would benefit from focused investment'}. Key opportunities center on documentation, consistency and personal branding. The recommendations below are generated from public data only and respect user privacy — no private information was accessed.`

  return {
    executiveSummary,
    strengths,
    weaknesses,
    developerLevel: level,
    careerSuggestions: career,
    resumeSuggestions: resume,
    portfolioSuggestions: portfolio,
    githubImprovements: githubImp,
    learningRoadmap: roadmap,
    openSourceSuggestions: oss,
    privacyNote:
      'This report was generated entirely from publicly available data via official public APIs. No private accounts were accessed, no authentication was bypassed, and no sensitive personal information was collected.',
  }
}
