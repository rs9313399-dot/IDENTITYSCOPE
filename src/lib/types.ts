/**
 * IdentityScope AI — Core type system
 * Shared types for the digital identity report, scores, and connector payloads.
 */

export type QueryType = 'username' | 'github' | 'website' | 'email'

export interface ScanInput {
  query: string
  type: QueryType
  github?: string
  email?: string
  website?: string
}

/* ----------------------------- Scores ----------------------------- */

export interface ScoreSet {
  developer: number
  portfolio: number
  openSource: number
  repository: number
  documentation: number
  consistency: number
  security: number
  community: number
  brand: number
  overall: number
}

/* ----------------------------- Connectors ----------------------------- */

export interface ConnectorResult {
  id: string
  name: string
  status: 'found' | 'not_found' | 'error' | 'skipped'
  url?: string
  data?: unknown
  error?: string
  meta?: Record<string, unknown>
}

export interface SocialProfile {
  platform: string
  handle: string | null
  url: string | null
  found: boolean
  followers?: number
  following?: number
  posts?: number
  bio?: string
  avatar?: string
  joinedAt?: string
  meta?: Record<string, unknown>
}

/* ----------------------------- GitHub ----------------------------- */

export interface GitHubRepo {
  id: number
  name: string
  fullName: string
  description: string | null
  url: string
  homepage: string | null
  stars: number
  forks: number
  watchers: number
  openIssues: number
  language: string | null
  topics: string[]
  isFork: boolean
  isArchived: boolean
  license: string | null
  hasReadme: boolean
  hasWiki: boolean
  hasPages: boolean
  defaultBranch: string
  size: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  readmeQuality: number // 0-100
  health: number // 0-100
  score: number // 0-100
}

export interface GitHubLanguageStat {
  language: string
  bytes: number
  percentage: number
  color: string
}

export interface GitHubUser {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  twitter: string | null
  avatarUrl: string
  htmlUrl: string
  followers: number
  following: number
  publicRepos: number
  publicGists: number
  createdAt: string
  updatedAt: string
  hireable: boolean | null
  type: string
}

export interface GitHubAnalysis {
  user: GitHubUser
  repos: GitHubRepo[]
  languages: GitHubLanguageStat[]
  totalStars: number
  totalForks: number
  pinnedRepos: GitHubRepo[]
  bestProject: GitHubRepo | null
  worstProject: GitHubRepo | null
  inactiveProjects: GitHubRepo[]
  contributionWeeks: ContributionWeek[]
  commitActivity: { day: string; commits: number }[]
  socialLinks: { platform: string; url: string }[]
  readmeQuality: number
}

export interface ContributionWeek {
  week: number
  days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]
}

/* ----------------------------- Portfolio / Website ----------------------------- */

export interface WebsiteAnalysis {
  url: string
  finalUrl: string
  reachable: boolean
  https: boolean
  httpStatus: number
  title: string | null
  description: string | null
  metaTags: { name: string; content: string }[]
  openGraph: Record<string, string>
  twitterCard: Record<string, string>
  favicon: string | null
  responsive: boolean
  performance: number // 0-100 heuristic
  seo: number // 0-100 heuristic
  accessibility: number // 0-100 heuristic
  securityHeaders: SecurityHeader[]
  technologies: string[]
  language: string | null
  pageSizeBytes: number
  loadTimeMs: number
  score: number
}

export interface SecurityHeader {
  name: string
  present: boolean
  value?: string
  severity: 'good' | 'warning' | 'bad'
}

/* ----------------------------- Email ----------------------------- */

export interface EmailAnalysis {
  email: string
  valid: boolean
  format: boolean
  disposable: boolean
  mxRecord: boolean
  domain: string | null
  localPart: string | null
  deliverability: 'high' | 'medium' | 'low' | 'unknown'
  suggestions: string[]
}

/* ----------------------------- Codeforces ----------------------------- */

export interface CodeforcesProfile {
  handle: string
  rating: number | null
  maxRating: number | null
  rank: string | null
  maxRank: string | null
  contribution: number
  friendOfCount: number
  avatar: string | null
  organization: string | null
  city: string | null
  country: string | null
  lastOnlineTimeSeconds: number
  registrationTimeSeconds: number
  solvedCount?: number
  url: string
  found: boolean
}

/* ----------------------------- NPM / PyPI ----------------------------- */

export interface PackageRegistryProfile {
  registry: 'npm' | 'pypi'
  name: string
  found: boolean
  description: string | null
  version: string | null
  url: string
  downloads?: number
  maintainers: number
  lastUpdated: string | null
  score?: number
}

/* ----------------------------- AI Report ----------------------------- */

export interface AIReport {
  executiveSummary: string
  strengths: string[]
  weaknesses: string[]
  developerLevel: string
  careerSuggestions: string[]
  resumeSuggestions: string[]
  portfolioSuggestions: string[]
  githubImprovements: string[]
  learningRoadmap: { phase: string; items: string[] }[]
  openSourceSuggestions: string[]
  privacyNote?: string
}

/* ----------------------------- Full Report ----------------------------- */

export interface DigitalIdentityReport {
  id: string
  input: ScanInput
  createdAt: string
  scores: ScoreSet
  github: GitHubAnalysis | null
  website: WebsiteAnalysis | null
  email: EmailAnalysis | null
  codeforces: CodeforcesProfile | null
  npm: PackageRegistryProfile | null
  pypi: PackageRegistryProfile | null
  social: SocialProfile[]
  connectors: ConnectorResult[]
  aiReport: AIReport | null
  durationMs: number
}

/* ----------------------------- Compare ----------------------------- */

export interface CompareResult {
  left: DigitalIdentityReport
  right: DigitalIdentityReport
}
