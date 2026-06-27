/** /api/connectors — lists the available public connectors for the UI */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const CONNECTORS = [
  { id: 'github', name: 'GitHub', category: 'developer', description: 'Public GitHub profile, repos, languages, contribution heatmap.', auth: false },
  { id: 'codeforces', name: 'Codeforces', category: 'competitive', description: 'Public competitive programming rating & rank.', auth: false },
  { id: 'npm', name: 'NPM', category: 'package', description: 'Published NPM packages by author.', auth: false },
  { id: 'pypi', name: 'PyPI', category: 'package', description: 'Published Python packages on PyPI.', auth: false },
  { id: 'reddit', name: 'Reddit', category: 'social', description: 'Public Reddit profile (about.json).', auth: false },
  { id: 'devto', name: 'Dev.to', category: 'social', description: 'Public Dev.to author profile.', auth: false },
  { id: 'hashnode', name: 'Hashnode', category: 'social', description: 'Public Hashnode profile via GraphQL.', auth: false },
  { id: 'medium', name: 'Medium', category: 'social', description: 'Public Medium profile presence check.', auth: false },
  { id: 'kaggle', name: 'Kaggle', category: 'social', description: 'Public Kaggle profile presence check.', auth: false },
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'social', description: 'Public Stack Overflow profile via SE API.', auth: false },
  { id: 'website', name: 'Website Analyzer', category: 'portfolio', description: 'Public HTTP/HTML meta, security headers, tech fingerprint.', auth: false },
  { id: 'email', name: 'Email Validator', category: 'security', description: 'Format, disposable & MX record validation via DoH.', auth: false },
]

export async function GET() {
  return NextResponse.json({ connectors: CONNECTORS })
}
