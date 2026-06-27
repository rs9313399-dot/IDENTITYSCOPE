/**
 * Codeforces connector — public REST API.
 * Docs: https://codeforces.com/apiHelp
 */

import { cacheGet, cacheSet, fetchJson, makeCachePrefix } from './base'
import type { CodeforcesProfile } from '@/lib/types'

const PREFIX = makeCachePrefix('codeforces')
const CACHE_TTL = 60 * 10

interface CFUser {
  handle: string
  rating?: number
  maxRating?: number
  rank?: string
  maxRank?: string
  contribution: number
  friendOfCount: number
  avatar: string
  organization?: string
  city?: string
  country?: string
  lastOnlineTimeSeconds: number
  registrationTimeSeconds: number
}

interface CFResponse<T> {
  status: string
  result: T
  comment?: string
}

export function validate(input: { query?: string }) {
  const handle = (input.query || '').trim()
  return /^[a-zA-Z0-9_-]{1,24}$/.test(handle)
}

export async function search(input: { query?: string }): Promise<CodeforcesProfile> {
  const handle = (input.query || '').trim()
  const cacheKey = `${PREFIX}${handle.toLowerCase()}`
  const cached = cacheGet<CodeforcesProfile>(cacheKey)
  if (cached) return cached

  const data = await fetchJson<CFResponse<CFUser[]>>(
    `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
    { cacheTtl: CACHE_TTL, retries: 2 }
  )

  if (data.status !== 'OK' || !data.result || !data.result[0]) {
    return {
      handle,
      rating: null,
      maxRating: null,
      rank: null,
      maxRank: null,
      contribution: 0,
      friendOfCount: 0,
      avatar: null,
      organization: null,
      city: null,
      country: null,
      lastOnlineTimeSeconds: 0,
      registrationTimeSeconds: 0,
      url: `https://codeforces.com/profile/${handle}`,
      found: false,
    }
  }

  const u = data.result[0]
  const profile: CodeforcesProfile = {
    handle: u.handle,
    rating: u.rating ?? null,
    maxRating: u.maxRating ?? null,
    rank: u.rank ?? null,
    maxRank: u.maxRank ?? null,
    contribution: u.contribution ?? 0,
    friendOfCount: u.friendOfCount ?? 0,
    avatar: u.avatar ?? null,
    organization: u.organization ?? null,
    city: u.city ?? null,
    country: u.country ?? null,
    lastOnlineTimeSeconds: u.lastOnlineTimeSeconds,
    registrationTimeSeconds: u.registrationTimeSeconds,
    url: `https://codeforces.com/profile/${u.handle}`,
    found: true,
  }
  cacheSet(cacheKey, profile, CACHE_TTL)
  return profile
}

export const codeforcesConnector = { id: 'codeforces', name: 'Codeforces', validate, search }
