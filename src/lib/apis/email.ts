/**
 * Email validation connector.
 * Validates format, checks for disposable domains, and checks MX records via
 * a public DNS-over-HTTPS endpoint (Cloudflare). No third-party API keys.
 *
 * Privacy-first: never sends the email to any third party except the public
 * DNS resolver (which only sees the domain). We do NOT ping the SMTP server.
 */

import { cacheGet, cacheSet, fetchJson, makeCachePrefix } from './base'
import type { EmailAnalysis } from '@/lib/types'

const PREFIX = makeCachePrefix('email')
const CACHE_TTL = 60 * 30

// A curated list of common disposable email providers
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'throwaway.email', 'yopmail.com', 'getnada.com',
  'dispostable.com', 'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com',
  'spam4.me', 'trashmail.com', 'fakeinbox.com', 'mailnesia.com',
  'emailondeck.com', 'tempinbox.com', 'mohmal.com', 'tempmailo.com',
  'minutemail.com', 'tempr.email', 'discard.email', 'mailcatch.com',
])

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function validate(input: { email?: string }) {
  const email = (input.email || '').trim().toLowerCase()
  return EMAIL_RE.test(email)
}

interface DohResponse {
  Status: number
  Answer?: { name: string; type: number; TTL: number; data: string }[]
}

async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const data = await fetchJson<DohResponse>(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { cacheTtl: CACHE_TTL, retries: 2, headers: { accept: 'application/dns-json' } }
    )
    return Array.isArray(data.Answer) && data.Answer.length > 0
  } catch {
    return false
  }
}

export async function search(input: { email?: string }): Promise<EmailAnalysis> {
  const email = (input.email || '').trim().toLowerCase()
  if (!email) {
    return {
      email: '',
      valid: false,
      format: false,
      disposable: false,
      mxRecord: false,
      domain: null,
      localPart: null,
      deliverability: 'unknown',
      suggestions: [],
    }
  }

  const cacheKey = `${PREFIX}${email}`
  const cached = cacheGet<EmailAnalysis>(cacheKey)
  if (cached) return cached

  const format = EMAIL_RE.test(email)
  const [localPart, domain] = email.split('@')
  const disposable = domain ? DISPOSABLE_DOMAINS.has(domain.toLowerCase()) : false
  const mxRecord = domain ? await hasMxRecord(domain.toLowerCase()) : false

  let deliverability: EmailAnalysis['deliverability'] = 'unknown'
  const suggestions: string[] = []

  if (!format) {
    deliverability = 'low'
    suggestions.push('Email format is invalid. Check for typos.')
  } else if (disposable) {
    deliverability = 'low'
    suggestions.push('This is a disposable email domain — not suitable for long-term contact.')
  } else if (!mxRecord) {
    deliverability = 'low'
    suggestions.push('No MX records found for this domain — emails will not be delivered.')
  } else if (domain && (domain === 'gmail.com' || domain === 'outlook.com' || domain === 'yahoo.com')) {
    deliverability = 'high'
  } else {
    deliverability = 'medium'
    suggestions.push('Domain has valid MX records. Verify with a confirmation email for full confidence.')
  }

  const analysis: EmailAnalysis = {
    email,
    valid: format && !disposable && mxRecord,
    format,
    disposable,
    mxRecord,
    domain: domain ?? null,
    localPart: localPart ?? null,
    deliverability,
    suggestions,
  }
  cacheSet(cacheKey, analysis, CACHE_TTL)
  return analysis
}

export const emailConnector = { id: 'email', name: 'Email Validator', validate, search }
