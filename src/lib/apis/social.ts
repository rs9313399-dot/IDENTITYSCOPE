/**
 * Social discovery connector.
 * Probes public endpoints across multiple platforms for a username.
 * Only PUBLIC, unauthenticated endpoints are used. No scraping behind auth.
 */

import { cacheGet, cacheSet, resilientFetch, makeCachePrefix } from './base'
import type { SocialProfile } from '@/lib/types'

const PREFIX = makeCachePrefix('social')
const CACHE_TTL = 60 * 10

interface ProbeInput {
  username: string
  github?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function tryGet(url: string, timeoutMs = 8000): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await resilientFetch(url, { timeoutMs, retries: 1, cacheTtl: CACHE_TTL })
    const text = await res.text().catch(() => '')
    return { ok: res.ok, status: res.status, text }
  } catch {
    return { ok: false, status: 0, text: '' }
  }
}

async function probeReddit(username: string): Promise<SocialProfile> {
  const url = `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`
  const { ok, status, text } = await tryGet(url)
  const profile: SocialProfile = {
    platform: 'Reddit',
    handle: username,
    url: `https://www.reddit.com/user/${username}`,
    found: false,
  }
  if (!ok) return profile
  try {
    const json = JSON.parse(text)
    const data = json?.data
    if (data && !data.is_suspended) {
      profile.found = true
      profile.followers = data.subreddit?.subscribers ?? 0
      profile.bio = data.subreddit?.public_description ?? null
      profile.avatar = data.icon_img ?? data.snoovatar_img ?? null
      profile.joinedAt = new Date(data.created_utc * 1000).toISOString()
      profile.posts = data.total_karma ?? 0
    }
  } catch {
    /* ignore */
  }
  return profile
}

async function probeDevto(username: string): Promise<SocialProfile> {
  const url = `https://dev.to/api/users/by_username?url=${encodeURIComponent(username)}`
  const { ok, text } = await tryGet(url)
  const profile: SocialProfile = {
    platform: 'Dev.to',
    handle: username,
    url: `https://dev.to/${username}`,
    found: false,
  }
  if (!ok) return profile
  try {
    const data = JSON.parse(text)
    if (data && data.username) {
      profile.found = true
      profile.bio = data.summary ?? null
      profile.avatar = data.profile_image ?? null
      profile.joinedAt = data.joined_at ?? null
    }
  } catch {
    /* ignore */
  }
  return profile
}

async function probeHashnode(username: string): Promise<SocialProfile> {
  const profile: SocialProfile = {
    platform: 'Hashnode',
    handle: username,
    url: `https://hashnode.com/@${username}`,
    found: false,
  }
  // Hashnode GraphQL — public, no auth needed
  try {
    const res = await resilientFetch('https://gql.hashnode.com/', {
      timeoutMs: 9000,
      retries: 1,
      headers: { 'Content-Type': 'application/json' },
      cacheTtl: 0,
    })
    // The above GET won't work; we need POST. Use a direct fetch instead.
    void res
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($username:String!){user(username:$username){username name bio followersCount followingsCount publications{edges{node{name slug}}}} profilePicture}}`,
        variables: { username },
      }),
    })
    if (res.ok) {
      const json = await res.json()
      const u = json?.data?.user
      if (u) {
        profile.found = true
        profile.bio = u.bio ?? null
        profile.followers = u.followersCount ?? 0
        profile.following = u.followingsCount ?? 0
        profile.avatar = u.profilePicture ?? null
      }
    }
  } catch {
    /* ignore */
  }
  return profile
}

async function probeMedium(username: string): Promise<SocialProfile> {
  // Medium has no official public user API. We probe the public profile page (HEAD-equivalent).
  const url = `https://medium.com/@${encodeURIComponent(username)}`
  const { ok, status } = await tryGet(url, 7000)
  return {
    platform: 'Medium',
    handle: username,
    url,
    found: ok && status === 200,
  }
}

async function probeKaggle(username: string): Promise<SocialProfile> {
  const url = `https://www.kaggle.com/${encodeURIComponent(username)}`
  const { ok, status } = await tryGet(url, 7000)
  return {
    platform: 'Kaggle',
    handle: username,
    url,
    found: ok && status === 200,
  }
}

async function probeStackOverflow(username: string): Promise<SocialProfile> {
  // Stack Exchange API — public, no auth
  const profile: SocialProfile = {
    platform: 'Stack Overflow',
    handle: username,
    url: `https://stackoverflow.com/users/${encodeURIComponent(username)}`,
    found: false,
  }
  try {
    const res = await resilientFetch(
      `https://api.stackexchange.com/2.3/users?inname=${encodeURIComponent(username)}&site=stackoverflow&pagesize=1`,
      { timeoutMs: 9000, retries: 1, cacheTtl: CACHE_TTL }
    )
    if (res.ok) {
      const json = await res.json()
      const u = json?.items?.[0]
      if (u && u.display_name?.toLowerCase() === username.toLowerCase()) {
        profile.found = true
        profile.url = u.link
        profile.avatar = u.profile_image ?? null
        profile.followers = u.reputation ?? 0
        profile.bio = u.location ?? null
        profile.joinedAt = new Date(u.creation_date * 1000).toISOString()
      }
    }
  } catch {
    /* ignore */
  }
  return profile
}

async function probeGitHubAsSocial(username: string): Promise<SocialProfile> {
  // Light probe (not full analysis) for the discovery grid
  const profile: SocialProfile = {
    platform: 'GitHub',
    handle: username,
    url: `https://github.com/${username}`,
    found: false,
  }
  try {
    const res = await resilientFetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      timeoutMs: 9000,
      retries: 1,
      cacheTtl: CACHE_TTL,
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (res.ok) {
      const u = await res.json()
      profile.found = true
      profile.avatar = u.avatar_url ?? null
      profile.bio = u.bio ?? null
      profile.followers = u.followers ?? 0
      profile.following = u.following ?? 0
      profile.posts = u.public_repos ?? 0
      profile.joinedAt = u.created_at ?? null
    }
  } catch {
    /* ignore */
  }
  return profile
}

const probes = [
  probeGitHubAsSocial,
  probeReddit,
  probeDevto,
  probeHashnode,
  probeMedium,
  probeKaggle,
  probeStackOverflow,
]

export async function search(input: ProbeInput): Promise<SocialProfile[]> {
  const username = (input.github || input.username || '').trim()
  if (!username) return []
  const cacheKey = `${PREFIX}${username.toLowerCase()}`
  const cached = cacheGet<SocialProfile[]>(cacheKey)
  if (cached) return cached

  // Run probes with limited concurrency to be polite to upstreams
  const results: SocialProfile[] = []
  const concurrency = 3
  for (let i = 0; i < probes.length; i += concurrency) {
    const batch = probes.slice(i, i + concurrency)
    const out = await Promise.all(batch.map((fn) => fn(username).catch(() => null)))
    for (const p of out) {
      if (p) results.push(p)
    }
    await sleep(200)
  }
  cacheSet(cacheKey, results, CACHE_TTL)
  return results
}

export const socialConnector = { id: 'social', name: 'Social Discovery', search }
