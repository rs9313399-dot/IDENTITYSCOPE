'use client'

import * as React from 'react'
import type { AIReport } from '@/lib/types'

/**
 * Progressive JSON parser for the streaming AI report.
 * As tokens arrive, extracts completed fields from the partial JSON
 * and returns them for live rendering.
 *
 * Strategy: use a forgiving string-scan approach that finds completed
 * key-value pairs, array elements, and string values in the partial text.
 */
export interface PartialAIReport {
  executiveSummary?: string
  strengths?: string[]
  weaknesses?: string[]
  developerLevel?: string
  careerSuggestions?: string[]
  resumeSuggestions?: string[]
  portfolioSuggestions?: string[]
  githubImprovements?: string[]
  learningRoadmap?: { phase: string; items: string[] }[]
  openSourceSuggestions?: string[]
  privacyNote?: string
  // currently-streaming field name
  currentField?: string
}

/** Extract a completed string value for a given key from partial JSON. */
function extractString(json: string, key: string): string | undefined {
  // Match "key": "value" where value is a complete (closed) string
  const re = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm')
  const m = json.match(re)
  return m ? unescape(m[1]) : undefined
}

/** Extract a completed array of strings for a given key. */
function extractStringArray(json: string, key: string): string[] | undefined {
  const re = new RegExp(`"${key}"\\s*:\\s*\\[`, 'm')
  const m = json.match(re)
  if (!m) return undefined
  const start = m.index! + m[0].length
  // Find the matching closing bracket
  let depth = 1
  let i = start
  let inString = false
  let escape = false
  for (; i < json.length && depth > 0; i++) {
    const c = json[i]
    if (escape) {
      escape = false
      continue
    }
    if (c === '\\') {
      escape = true
      continue
    }
    if (c === '"') inString = !inString
    if (inString) continue
    if (c === '[') depth++
    else if (c === ']') depth--
  }
  if (depth > 0) {
    // Array not yet closed — extract what we have so far
    const partial = json.slice(start, i)
    return parseStringArray(partial)
  }
  const full = json.slice(start, i - 1)
  return parseStringArray(full)
}

function parseStringArray(content: string): string[] {
  const items: string[] = []
  const re = /"((?:[^"\\]|\\.)*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    items.push(unescape(m[1]))
  }
  return items
}

/** Extract the learning roadmap array (array of objects). */
function extractRoadmap(json: string): { phase: string; items: string[] }[] | undefined {
  const re = /"learningRoadmap"\s*:\s*\[/m
  const m = json.match(re)
  if (!m) return undefined
  const start = m.index! + m[0].length
  let depth = 1
  let i = start
  let inString = false
  let escape = false
  for (; i < json.length && depth > 0; i++) {
    const c = json[i]
    if (escape) {
      escape = false
      continue
    }
    if (c === '\\') {
      escape = true
      continue
    }
    if (c === '"') inString = !inString
    if (inString) continue
    if (c === '[' || c === '{') depth++
    else if (c === ']' || c === '}') depth--
  }
  const content = depth > 0 ? json.slice(start, i) : json.slice(start, i - 1)
  // Parse objects with phase + items
  const phases: { phase: string; items: string[] }[] = []
  const objRe = /\{[^{}]*"phase"\s*:\s*"((?:[^"\\]|\\.)*)"[^{}]*\}/g
  let om: RegExpExecArray | null
  while ((om = objRe.exec(content)) !== null) {
    const phase = unescape(om[1])
    // Extract items array from this object
    const itemsRe = /"items"\s*:\s*\[([^\]]*)\]/
    const im = om[0].match(itemsRe)
    const items = im ? parseStringArray(im[1]) : []
    phases.push({ phase, items })
  }
  return phases
}

function unescape(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\r/g, '\r')
}

/** Detect the field currently being written (last opened key). */
function detectCurrentField(json: string): string | undefined {
  // Find the last "key": that doesn't yet have a complete value
  const keys = [
    'executiveSummary',
    'strengths',
    'weaknesses',
    'developerLevel',
    'careerSuggestions',
    'resumeSuggestions',
    'portfolioSuggestions',
    'githubImprovements',
    'learningRoadmap',
    'openSourceSuggestions',
  ]
  // Work backwards through the keys as they appear
  let lastOpen: string | undefined
  for (const k of keys) {
    const re = new RegExp(`"${k}"\\s*:`)
    const m = json.match(re)
    if (m && m.index !== undefined) {
      lastOpen = k
    }
  }
  return lastOpen
}

/** Parse a partial JSON string into a PartialAIReport. */
export function parsePartialAIReport(streamedText: string): PartialAIReport {
  if (!streamedText || streamedText.length < 5) return {}
  // Strip markdown fences if present
  let json = streamedText.trim()
  const fence = json.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) json = fence[1].trim()
  // Find the first {
  const start = json.indexOf('{')
  if (start < 0) return {}
  json = json.slice(start)

  const partial: PartialAIReport = {
    executiveSummary: extractString(json, 'executiveSummary'),
    strengths: extractStringArray(json, 'strengths'),
    weaknesses: extractStringArray(json, 'weaknesses'),
    developerLevel: extractString(json, 'developerLevel'),
    careerSuggestions: extractStringArray(json, 'careerSuggestions'),
    resumeSuggestions: extractStringArray(json, 'resumeSuggestions'),
    portfolioSuggestions: extractStringArray(json, 'portfolioSuggestions'),
    githubImprovements: extractStringArray(json, 'githubImprovements'),
    learningRoadmap: extractRoadmap(json),
    openSourceSuggestions: extractStringArray(json, 'openSourceSuggestions'),
    currentField: detectCurrentField(json),
  }

  return partial
}

/** Count how many fields are populated (for progress indication). */
export function countPopulatedFields(partial: PartialAIReport): number {
  let count = 0
  if (partial.executiveSummary) count++
  if (partial.strengths?.length) count++
  if (partial.weaknesses?.length) count++
  if (partial.developerLevel) count++
  if (partial.careerSuggestions?.length) count++
  if (partial.resumeSuggestions?.length) count++
  if (partial.portfolioSuggestions?.length) count++
  if (partial.githubImprovements?.length) count++
  if (partial.learningRoadmap?.length) count++
  if (partial.openSourceSuggestions?.length) count++
  return count
}

export const TOTAL_AI_FIELDS = 10
