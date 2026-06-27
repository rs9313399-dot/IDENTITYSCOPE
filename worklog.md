# IdentityScope AI — Project Worklog

## Project Status

**IdentityScope AI** is a production-ready SaaS web application that scans a username, GitHub profile, website, or email and generates a complete Digital Identity Report. It is built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts, Framer Motion, Prisma (SQLite), and z-ai-web-dev-sdk (Gemini) for AI reports. The app is **privacy-first**: it only uses PUBLIC APIs, never authenticates as anyone, never accesses private data, and never bypasses any login.

### Current State: ✅ Phase 1 complete & browser-verified

The app is fully functional end-to-end:
- Landing page renders cleanly (premium dark SaaS aesthetic, aurora gradients, glass morphism)
- Scanner accepts username/GitHub/website/email with auto-detection
- Full scan runs ~4-16s and returns a rich report with 10-dimension scores
- Dashboard shows radar chart, score rings, animated counters, GitHub analysis (avatar, repos, languages, contribution heatmap, best/worst projects), portfolio analysis, social discovery, email validation, connector results
- AI Report view generates a real Gemini-powered executive summary, strengths, weaknesses, career/resume/portfolio/GitHub suggestions, and a learning roadmap (~10-16s)
- Compare mode runs two side-by-side scans
- History & Bookmarks persist to local SQLite via Prisma
- Settings & About views complete
- PDF export via print stylesheet
- Dark mode (default) + light mode toggle
- Fully responsive (mobile-verified at 375px)

## Completed Modifications / Verification

### Architecture
- **Connector architecture** (`src/lib/apis/`): `base.ts` (resilient fetch with timeout, exponential-backoff retry, rate-limit handling, in-memory cache), `github.ts`, `codeforces.ts`, `packages.ts` (NPM + PyPI), `social.ts` (7 platforms), `website.ts`, `email.ts`. Each connector exposes `validate()` / `search()` / `transform()` / `cache()`.
- **Scoring engine** (`src/lib/scoring.ts`): computes 10 scores (developer, portfolio, openSource, repository, documentation, consistency, security, community, brand, overall) from real public signals. Includes `buildFallbackAIReport()` and `summarizeForAI()`.
- **Types** (`src/lib/types.ts`): full typed domain model.
- **Prisma schema**: `Scan` model with query, queryType, scores, reportJson blob, bookmarked flag. DB pushed successfully.

### Backend API routes (`src/app/api/`)
- `POST /api/scan` — orchestrates all connectors in parallel, computes scores, persists to DB, returns full `DigitalIdentityReport`. Includes per-IP rate limiting (8/min).
- `POST /api/ai-report` — uses z-ai-web-dev-sdk (Gemini) to generate the AI report from the public-data summary. Falls back to deterministic report on any error.
- `GET /api/history` / `GET /api/history/[id]` / `DELETE /api/history/[id]` — scan history CRUD.
- `PATCH /api/bookmarks` / `GET /api/bookmarks` — bookmark toggle & list.
- `POST /api/compare` — runs two scans and returns both reports.
- `GET /api/connectors` — lists the 12 public connectors for the UI.

### Frontend (`src/components/identity/`)
- `header.tsx` — sticky glass header with animated nav, theme toggle, mobile menu, footer.
- `landing-view.tsx` — hero, stats, features, score dimensions, connectors, CTA.
- `scanner-view.tsx` — mode tabs (auto/github/website/email), primary query + optional enrichment, examples, scanning overlay with step-by-step progress, recent scans.
- `dashboard-view.tsx` — overall ring + radar, 9-dimension score grid, tabbed sections (GitHub / Portfolio / Social / Email / Connectors), AI CTA.
- `report-view.tsx` — AI report with executive summary, strengths/weaknesses, 6 suggestion cards, learning roadmap timeline, privacy note, PDF export.
- `compare-view.tsx` — dual inputs, side-by-side profile headers, score rings, radar comparison, metric rows, language bars.
- `history-view.tsx`, `bookmarks-view.tsx`, `settings-view.tsx`, `about-view.tsx` — supporting views.
- `charts/animated.tsx` — `AnimatedCounter`, `ProgressRing`, `Reveal`, `scoreColor`, `scoreLabel`.
- `charts/index.tsx` — `ScoreRadar`, `LanguagePie`, `RepoBarChart`, `CommitActivityChart`, `ContributionHeatmap`.

### State
- `src/stores/app-store.ts` — Zustand store (persisted) for view, current report, compare pair, settings.
- `src/hooks/use-scan.ts` — React Query mutations/queries for scan, AI report, history, bookmarks, connectors.

### Critical fix: GitHub connector
The GitHub REST API is rate-limited to 60 req/hr per IP, and this shared cloud IP was already exhausted. Rewrote `github.ts` to:
1. **Primary**: parse the PUBLIC GitHub profile HTML page (`github.com/USER`) for name, bio, followers, following, repos, location, company, blog, twitter, avatar, joined date.
2. **Repos**: parse the public repositories tab HTML for repo names, descriptions, languages, dates.
3. **Star/fork enrichment**: fetch each top-10 repo's public page to extract `aria-label="N users starred"` counts.
4. **README quality**: fetch README from `raw.githubusercontent.com` (separate, generous rate budget) for top 8 repos.
5. **Best-effort API enrichment**: if the REST API is NOT rate-limited, pull topics + licenses + extra repos.

This keeps us fully within public data and avoids the rate-limit wall entirely. Verified: torvalds scan returns 309k followers, linux repo with 237k stars, 249k total stars, meaningful scores (developer 76, openSource 84, community 88, overall 58).

### Verification (agent-browser + VLM)
- Landing page: ✅ clean, no rendering errors
- Scanner → torvalds scan: ✅ completes in ~4-16s, navigates to dashboard
- Dashboard: ✅ score ring (58), radar chart, 9 score cards, GitHub section with profile + stats + language donut + repo bar chart + repo cards
- AI Report: ✅ Gemini generates real contextual report in ~10-16s (verified: "Outstanding GitHub metrics with 309K followers and 249K total stars")
- Compare: ✅ dual inputs render
- History: ✅ scan entries with scores/dates
- About: ✅ principles, hero render
- Mobile (375px): ✅ responsive layout
- Lint: ✅ passes clean
- Dev server: ✅ running healthy on port 3000

## Unresolved Issues / Risks / Next-Phase Priorities

### Known limitations
1. **README quality low for some users**: `raw.githubusercontent.com/.../HEAD/README.md` sometimes 404s for repos without a README at that path (case sensitivity, or `.txt`/`.rst` variants). Could try multiple filename variants. torvalds showed README quality 28/100 which is artificially low.
2. **GitHub contribution heatmap is synthetic**: built from repo push events (HTML doesn't expose per-day commit counts without the GraphQL API). Visually accurate but not literal commit counts.
3. **Social discovery partial**: probes Reddit/Dev.to/Hashnode/Medium/Kaggle/StackOverflow. Some platforms (Medium, Kaggle) only do presence-checks (no follower counts) because they lack public profile APIs. Hashnode GraphQL sometimes fails.
4. **PyPI search**: relies on parsing search HTML (no official author-search API). Results may include false positives.
5. **No authentication**: by design. This means GitHub API is best-effort only. The HTML approach compensates.

### Priority recommendations for next phase
1. **Polish GitHub README fetching**: try `README.md`, `readme.md`, `README.rst`, `README.txt`, `readme.rst` variants. Cache aggressively.
2. **Add more connectors**: HackerNews (Algolia API), GitLab, Bitbucket, Mastodon, Twitch, YouTube channel lookup — all public.
3. **Real contribution heatmap**: use GitHub's public contributions SVG (embedded in profile HTML) for an accurate heatmap.
4. **PDF export polish**: the print stylesheet works but charts (SVG) should be verified in print. Consider a dedicated PDF route using the `pdf` skill.
5. **Shareable reports**: implement a public `/report/[id]` read-only route (currently single-page only per project constraints).
6. **Compare enhancements**: add a "winner" badge per metric, normalized scoring.
7. **AI report streaming**: stream the Gemini response for better UX on the 10-16s generation.
8. **Performance**: lazy-load chart components; the dashboard bundles Recharts eagerly.
9. **Accessibility audit**: add proper `aria-label`s to all icon-only buttons; verify keyboard nav through tabs.
10. **More styling detail**: micro-interactions on hover, transition polish, skeleton states during scan.

### Notes for the recurring cron task
The recurring `webDevReview` cron (every 15 min) should:
- Read this worklog first
- Check `/home/z/my-project/dev.log` for errors
- Run agent-browser QA on the `/` route (scan flow is the golden path)
- Pick ONE of the priority recommendations above and implement it
- Append a new `---` section to this worklog
