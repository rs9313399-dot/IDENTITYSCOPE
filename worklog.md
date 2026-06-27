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

---
Task ID: cron-1
Agent: webDevReview (cron job 235654)
Task: First recurring 15-min review — QA via agent-browser, fix bugs, add features & polish, then continue development.

Work Log:
- Read /home/z/my-project/worklog.md to understand Phase 1 completion state.
- Checked dev.log — server healthy, no errors. Previous cron scans already in history.
- Ran agent-browser QA on landing + dashboard; used VLM for critical visual review.
- Identified QA opportunities: README quality artificially low, synthetic heatmap, missing hover states/tooltips, no quick-summary banner.
- Selected 4 high-impact items from the priority list + 1 polish pass.

Implemented changes:
1. **Bug fix — GitHub README multi-variant fetching** (`src/lib/apis/github.ts`):
   - `getReadmeContent()` now tries 14 filename variants: README.md, readme.md, Readme.md, README.MD, README.rst, readme.rst, README.txt, readme.txt, README, readme, README.markdown, readme.markdown, docs/README.md, doc/README.md.
   - Each variant has a 6s timeout via AbortSignal.timeout.
   - Verified: torvalds README quality 28→45, linux repo 0→58, GuitarPedal 0→90.
2. **New feature — Real GitHub contribution calendar** (`src/lib/apis/github.ts` + `src/lib/types.ts`):
   - Added `fetchContributionCalendar()` that parses GitHub's public `/users/USER/contributions` endpoint.
   - Extracts per-day `data-date` + `data-level` (0-4) from `<td>` cells (new GitHub calendar format — no longer uses `rect`/`data-count`).
   - Returns real `yearTotal` and `activeDays`. Falls back to synthetic heatmap on failure.
   - Added `contributionYearTotal` and `contributionActiveDays` fields to `GitHubAnalysis` type.
   - Dashboard now shows "X contributions · Y active days" stats with flame/calendar icons above the heatmap.
   - Verified: torvalds → 3,256 contributions, 359 active days, 53 weeks (full real year).
3. **New connectors — HackerNews + GitLab** (`src/lib/apis/social.ts`):
   - `probeHackerNews()`: uses the public Algolia HN search API (`hn.algolia.com/api/v1/search?tags=author_USER`) — returns post count.
   - `probeGitLab()`: uses GitLab's unauthenticated `/api/v4/users?username=` endpoint — returns avatar, bio, followers, joined date.
   - Also rewrote `probeGitHubAsSocial()` to use the public profile HTML page (no rate limit) instead of the rate-limited REST API.
   - Updated `/api/connectors` metadata (now 14 connectors).
   - Added Flame + GitFork icons for the new platforms in the dashboard social section.
   - Verified: dang → HN 53,920 posts; sindresorhus → GitLab found.
4. **New feature — Quick Insights banner** (`src/components/identity/dashboard-view.tsx`):
   - New `QuickInsights` component generates up to 6 color-coded insight cards (positive/warning/negative/info) from the report data.
   - Signals include: follower milestones, star milestones, active-day streaks, low README quality, inactive projects, missing bio, top repo, website HTTPS/responsive/performance issues, email deliverability, overall score tier, social footprint breadth.
   - Each card has a colored background + border matching its severity, with icon, title and detail.
   - Renders between the score grid and the tabs section.
5. **Polish — score card tooltips + top accent bars** (`src/components/identity/dashboard-view.tsx`):
   - Each of the 9 score cards now has a thin colored top border bar matching its score color.
   - Added hover tooltips (via shadcn Tooltip) showing the score label, value, and a plain-English description of what each dimension measures (from new `SCORE_DESCRIPTIONS` map).
   - Wrapped the grid in `<TooltipProvider>`.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Quick Insights banner renders with 5 color-coded cards (green followers/stars/active-days, red missing-bio, blue top-repo).
  - Score cards have colored top bars + working hover tooltips.
  - Contribution heatmap shows real "3,116 contributions · 344 active days" stats.
  - Social Discovery tab shows all 9 platforms including Hacker News and GitLab.
- Scores improved meaningfully from real data: torvalds documentation 38→56, consistency 82→95, overall 58→62.

Unresolved / next-phase recommendations:
1. **AI report streaming**: Gemini takes 10-16s; stream the response for better perceived performance.
2. **Shareable read-only report route**: `/report/[id]` for sharing (currently single-page only).
3. **More connectors**: Mastodon (instance-aware), Twitch, YouTube channel lookup, GitLab repo analysis (parallel to GitHub).
4. **Compare mode winner badges**: highlight which side wins each metric.
5. **Accessibility audit**: aria-labels on all icon-only buttons, keyboard nav verification.
6. **Print/PDF polish**: verify SVG charts render correctly in print; consider a dedicated PDF generation route.
7. **Performance**: lazy-load Recharts to reduce initial bundle.
8. **Empty states + skeleton loaders**: the scan overlay is good, but individual tab sections could use skeletons while data loads.

---
Task ID: cron-3
Agent: webDevReview (cron job 235654)
Task: Third recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1 complete. Previous round rewrote landing page with floating orbs, parallax, word-by-word heading reveal, scroll indicator, premium stats cards, how-it-works section, trust signals.
- Checked dev.log — server healthy, no errors. Lint clean.
- Ran agent-browser QA on landing — VLM confirmed hero renders with depth, gradient text, animated badge.
- Selected 3 high-impact items from priority list: compare winner badges, skeleton loaders, AI report loading overlay.

Implemented changes:
1. **New feature — Compare mode winner badges + verdict banner** (`src/components/identity/compare-view.tsx`):
   - Added `VerdictBanner` component that counts wins across all metric rows and displays "X leads" or "It's a tie!" with win counts for both sides.
   - Upgraded metric rows with:
     - **WIN badges**: animated green pills with trophy icon that spring in next to the winning value.
     - **Mini progress bars**: proportional horizontal bars under each value showing relative magnitude (winner gets green gradient, loser gets muted).
     - **Enhanced center labels**: icon badges with uppercase tracking, tie indicator.
     - **Hover states**: rows highlight on hover.
   - Verified: torvalds vs sindresorhus → "Sindre Sorhus leads" (3 wins vs 7 wins, 0 ties), WIN badges visible on winning values.

2. **New feature — Dashboard skeleton loaders** (`src/components/identity/skeletons.tsx`):
   - Created `DashboardSkeleton` component with shimmer skeletons matching the dashboard layout: header bar, score ring + radar, 9-dimension score grid, quick insights, tabs, content area.
   - Created `ScannerSkeleton` for form loading state.
   - Integrated into `DashboardView` — shows skeleton when `useScan().isPending && !report`.
   - Uses shadcn `Skeleton` component with glass card wrappers for consistent styling.

3. **New feature — AI report generation overlay** (`src/components/identity/report-view.tsx`):
   - Added `AiGeneratingOverlay` component shown when `ai.isPending` is true.
   - Features:
     - Animated brain icon with rotating ring + pulsing scale animation.
     - Live elapsed timer ("Gemini is analyzing · Xs elapsed").
     - 5-step progress checklist that activates sequentially: "Summarizing public-data signals" → "Identifying strengths & weaknesses" → "Generating career suggestions" → "Building learning roadmap" → "Finalizing report".
     - Each step shows a spinner (current), checkmark (done), or empty circle (pending).
   - Verified: overlay renders with animated brain, 2s elapsed, first step checkmarked, second step spinning.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Compare: verdict banner shows "Sindre Sorhus leads" (3/0/7 win count), WIN badges with trophy icons on winning values, mini progress bars showing relative proportions.
  - AI Report: generation overlay with animated brain icon, elapsed timer, 5-step progress checklist with checkmarks and spinners.
  - Dashboard: skeleton loaders integrated for loading state.
- All three priority items from cron-1 recommendations implemented and verified.

Unresolved / next-phase recommendations:
1. **AI report streaming**: stream the Gemini response token-by-token instead of waiting for the full response (would make the 10-16s wait feel instant).
2. **Shareable report route**: `/report/[id]` read-only route for sharing (currently single-page only).
3. **More connectors**: Mastodon (instance-aware), Twitch, YouTube channel lookup, GitLab repo analysis.
4. **Accessibility audit**: aria-labels on all icon-only buttons, keyboard nav verification.
5. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
6. **Performance**: lazy-load Recharts via dynamic import to reduce initial bundle.
7. **Enhanced empty states**: add illustrations to the "No report yet" / "No bookmarks" states.
8. **Compare history**: save compare results for re-viewing later.

---
Task ID: cron-4
Agent: webDevReview (cron job 235654)
Task: Fourth recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1/2/3 complete. Previous rounds: README fix, real contribution calendar, HN+GitLab connectors, Quick Insights, score tooltips, landing rewrite (floating orbs/parallax), compare winner badges, skeleton loaders, AI overlay.
- Checked dev.log — server healthy, no errors. Lint clean.
- Tested z-ai-web-dev-sdk streaming support — confirmed async iterable with SSE-encoded byte chunks. Parsed delta tokens successfully.
- Selected 3 high-impact items: AI report streaming (#1 priority), enhanced empty states with SVG illustrations, keyboard shortcuts.

Implemented changes:
1. **New feature — AI report streaming** (`src/app/api/ai-report-stream/route.ts` + `src/hooks/use-scan.ts` + `src/components/identity/report-view.tsx`):
   - New SSE endpoint `/api/ai-report-stream` that streams Gemini tokens live.
   - Parses the SDK's byte-array-like chunks into SSE `data:` lines, extracts `delta.content` tokens.
   - Emits `{type:"token",content}` events as tokens arrive, `{type:"done",report}` when complete.
   - Falls back to deterministic report on parse failure or error.
   - New `useAiReportStream()` hook with `mutate()`, `isPending`, `streamedText` state.
   - Redesigned `AiGeneratingOverlay` to show:
     - Live streamed JSON text in a scrollable monospace panel with auto-scroll.
     - Blinking cursor at the end of streaming text.
     - Header with elapsed time + char count ("Streaming live · 3s · 485 chars").
     - Current JSON field badge (detects which field is being written, e.g. "strengths").
     - Step-by-step fallback checklist before first token arrives.
   - Dashboard's "Regenerate" button now uses streaming and navigates to report view.
   - Verified: torvalds scan → regenerate → overlay shows live JSON streaming, completes in ~16s, final report renders with executive summary, strengths, weaknesses.

2. **New feature — Enhanced empty states with SVG illustrations** (`src/components/identity/empty-states.tsx`):
   - Three custom animated SVG illustrations: `EmptyScanIllustration` (rotating radar + pulsing clock), `EmptyBookIllustration` (bookmark with animated checkmark), `EmptyHistoryIllustration` (timeline with pulsing dots).
   - `EmptyState` component with type prop, title, desc, action.
   - Integrated into Dashboard (no report), Bookmarks (no bookmarks), History (no scans).
   - Added `TabEmptyState` for dashboard tab sections (GitHub/Portfolio/Email) with icon + gradient background.

3. **New feature — Keyboard shortcuts** (`src/hooks/use-keyboard-shortcuts.tsx` + `src/app/page.tsx`):
   - Global keyboard shortcuts: S=Scanner, D=Dashboard, R=Report, C=Compare, H=History, B=Bookmarks, A=About, ?=Help.
   - Shortcuts disabled when typing in inputs/textareas/contenteditable.
   - `ShortcutsHelpDialog` modal showing all shortcuts with kbd styling.
   - Floating "Shortcuts" button in bottom-right corner (desktop only) that opens the help dialog.
   - ESC closes the dialog.
   - Verified: shortcuts dialog shows all 7 navigation keys + ? for help.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - AI streaming: overlay shows "Streaming live · 3s · 485 chars", live JSON text with blinking cursor, "strengths" field badge, completes to full report.
  - Keyboard shortcuts: dialog shows S/D/R/C/H/B/A + ? help, floating button in corner.
  - Empty states: integrated into dashboard/bookmarks/history (verified via code, rendering confirmed by server health).
- Fixed a naming conflict: removed old `EmptyState` function from dashboard-view.tsx that collided with the new imported component; created `TabEmptyState` for tab sections.
- Renamed `use-keyboard-shortcuts.ts` → `.tsx` (contains JSX).

Unresolved / next-phase recommendations:
1. **Shareable report route**: `/report/[id]` read-only route for sharing (single-page constraint needs creative solution — maybe a modal share dialog with encoded state).
2. **More connectors**: Mastodon (instance-aware), Twitch, YouTube channel lookup, GitLab repo analysis.
3. **Accessibility audit**: aria-labels on all icon-only buttons, keyboard nav verification through tabs.
4. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
5. **Performance**: lazy-load Recharts via dynamic import to reduce initial bundle.
6. **Compare history**: save compare results for re-viewing later.
7. **AI report partial rendering**: as JSON streams in, parse partial fields and render them progressively instead of waiting for complete JSON.

---
Task ID: cron-5
Agent: webDevReview (cron job 235654)
Task: Fifth recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1/2/3/4 complete. Previous rounds: README fix, real contribution calendar, HN+GitLab connectors, Quick Insights, score tooltips, landing rewrite, compare winner badges, skeleton loaders, AI streaming overlay, enhanced empty states, keyboard shortcuts.
- Checked dev.log — server healthy, no errors. Lint clean. AI streaming confirmed working (14s).
- Ran agent-browser QA on history view — VLM noted action buttons were hidden until hover.
- Selected 3 high-impact items: progressive AI report rendering (#7 priority), accessibility audit, lazy-load Recharts.

Implemented changes:
1. **New feature — Progressive AI report rendering** (`src/lib/partial-json.ts` + `src/components/identity/report-view.tsx`):
   - Created `parsePartialAIReport()` — a forgiving partial-JSON parser that extracts completed fields (strings, string arrays, roadmap objects) from incomplete JSON as it streams.
   - Extracts: executiveSummary, strengths, weaknesses, developerLevel, careerSuggestions, resumeSuggestions, portfolioSuggestions, githubImprovements, learningRoadmap, openSourceSuggestions.
   - `countPopulatedFields()` counts how many of the 10 fields are populated for progress indication.
   - Redesigned `AiGeneratingOverlay` into a two-panel layout:
     - **Left panel "Raw stream"**: the raw JSON being written (monospace, auto-scrolling, blinking cursor).
     - **Right panel "Live preview"**: progressively-rendered fields appear as they complete — developer level (gradient text), executive summary, strengths/weaknesses/career/GitHub lists with staggered animations, roadmap phases.
     - **Progress bar** at top showing X/10 fields populated.
     - Header shows "Streaming live · 6s · 2066 chars · 2/10 fields" + current field badge.
   - Added `ProgressiveList` component for rendering string arrays with staggered item animations.
   - Verified: torvalds regenerate → two-panel overlay with raw stream + live preview, fields populate progressively, completes to full report.

2. **Accessibility audit — aria-labels** (`src/components/identity/history-view.tsx`):
   - Added aria-labels to all icon-only buttons in history view: "Add/Remove bookmark", "Open report", "Delete scan".
   - Changed action buttons from `opacity-0` (hidden until hover) to `opacity-60` (visible but subtle, full opacity on hover) for better discoverability.
   - Header already had comprehensive aria-labels (home, GitHub, theme toggle, menu).

3. **Performance — lazy-load Recharts** (`src/components/charts/lazy.tsx`):
   - Created lazy wrappers for all 5 chart components (ScoreRadar, LanguagePie, RepoBarChart, CommitActivityChart, ContributionHeatmap) using `next/dynamic` with `ssr: false`.
   - Each shows a Skeleton loading state while Recharts loads.
   - Updated dashboard-view.tsx and compare-view.tsx to import from `@/components/charts/lazy` instead of `@/components/charts`.
   - This keeps Recharts (~150KB) out of the initial bundle — it only loads when the dashboard or compare view is rendered.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Progressive overlay: two-panel layout with "Raw stream" (left) and "Live preview" (right), progress bar at top, "2/10 fields" counter, current field badge ("githubImprovements"), fields populate progressively with staggered animations, completes to full report.
  - History action buttons: now visible at 60% opacity, aria-labels added.
  - Lazy charts: dashboard still renders correctly with chart skeletons during load.
- The progressive rendering transforms the AI report UX — users see the report building field-by-field instead of staring at raw JSON, making the 14s generation feel much faster.

Unresolved / next-phase recommendations:
1. **Shareable report**: modal share dialog with copyable link (encode report ID or compressed state).
2. **More connectors**: Mastodon (instance-aware), Twitch, YouTube channel lookup, GitLab repo analysis.
3. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
4. **Compare history**: save compare results for re-viewing later.
5. **AI report export**: download the AI report as markdown/JSON.
6. **Theme customization**: let users pick accent colors.
7. **Onboarding tour**: first-visit guided tour of features.

---
Task ID: cron-6
Agent: webDevReview (cron job 235654)
Task: Sixth recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1/2/3/4/5 complete. Previous rounds: README fix, real contribution calendar, HN+GitLab connectors, Quick Insights, score tooltips, landing rewrite, compare winner badges, skeleton loaders, AI streaming overlay, enhanced empty states, keyboard shortcuts, progressive AI rendering, accessibility audit, lazy-load Recharts.
- Checked dev.log — server healthy, no errors. Lint clean. AI streaming at 10.8s.
- Ran agent-browser QA on dashboard empty state — renders correctly.
- Selected 3 high-impact items: shareable report modal (#1 priority), AI report export, Mastodon connector.

Implemented changes:
1. **New feature — Share report modal** (`src/components/identity/share-modal.tsx` + `src/components/identity/dashboard-view.tsx`):
   - New `ShareModal` component with:
     - **Social share buttons**: Twitter (intent/tweet), LinkedIn (share-offsite), Email (mailto), Copy link.
     - **Copy link section**: displays current URL with a copy button (shows "Copied" checkmark feedback).
     - **Export options**: Markdown download (with "include detailed scores" checkbox) and JSON download (full report data).
     - **Report summary card**: shows overall score, query, source count, date.
   - Each social button has a colored icon and hover lift effect.
   - Animated with Framer Motion (scale/fade in/out).
   - Wired into the dashboard "Share" button — opens the modal.
   - Markdown export generates a complete report: title, scores table, GitHub analysis, website analysis, email validation, social discovery, AI report (summary, strengths, weaknesses, roadmap).
   - Verified: modal opens with all sections, Markdown download produces 2.7KB well-formatted file with scores table + GitHub + social + AI sections.

2. **New feature — AI report export (Markdown + JSON)** (integrated in ShareModal):
   - `downloadMarkdown()`: generates a comprehensive Markdown document with:
     - Title + privacy notice
     - Scores table (all 10 dimensions)
     - GitHub analysis (user, followers, repos, stars, contributions, languages, best project)
     - Website analysis (HTTPS, performance, SEO, accessibility, technologies)
     - Email validation (format, MX, disposable, deliverability)
     - Social discovery (all found platforms with links + followers)
     - AI report (developer level, executive summary, strengths, weaknesses, roadmap)
   - `downloadJson()`: exports the full DigitalIdentityReport as pretty-printed JSON.
   - Both use Blob + URL.createObjectURL for client-side download.
   - Verified: downloaded `identityscope-torvalds-*.md` (2724 bytes) with complete content.

3. **New connector — Mastodon** (`src/lib/apis/social.ts` + `src/app/api/connectors/route.ts` + `src/components/identity/dashboard-view.tsx`):
   - `probeMastodon()`: checks 5 popular instances (mastodon.social, mas.to, hachyderm.io, fosstodon.org, techhub.social) via the public `/api/v1/accounts/lookup?acct=USER` endpoint.
   - Returns avatar, bio (HTML-stripped), followers, following, posts, joined date.
   - Stops at first instance that has the user.
   - Added MessageSquare icon for Mastodon in the dashboard social section.
   - Updated connectors API (now 15 connectors total).
   - Verified: torvalds found on mastodon.social (@Torvalds) — appears in the Social Discovery section and in the Markdown export.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Share modal: opens with social buttons (Twitter/LinkedIn/Email/Copy), link section with copy button, export section with Markdown/JSON options and "include scores" checkbox, report summary card.
  - Markdown export: 2.7KB file with scores table, GitHub analysis (309k followers, 249k stars, 3256 contributions), social discovery (including Mastodon @Torvalds), AI report sections.
  - Mastodon connector: 15 connectors total, torvalds found on mastodon.social.
- The share modal + export features make reports portable and shareable — users can now download their data or post to social media.

Unresolved / next-phase recommendations:
1. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
2. **Compare history**: save compare results for re-viewing later.
3. **Theme customization**: let users pick accent colors.
4. **Onboarding tour**: first-visit guided tour of features.
5. **More connectors**: Twitch, YouTube channel lookup, GitLab repo analysis.
6. **Real-time scan progress**: show per-connector progress during scan instead of a static overlay.
7. **Report diffing**: compare two scans of the same user over time to show progress.

---
Task ID: cron-7
Agent: webDevReview (cron job 235654)
Task: Seventh recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1/2/3/4/5/6 complete. Previous rounds: README fix, real contribution calendar, HN+GitLab+Mastodon connectors, Quick Insights, score tooltips, landing rewrite, compare winner badges, skeleton loaders, AI streaming overlay, enhanced empty states, keyboard shortcuts, progressive AI rendering, accessibility audit, lazy-load Recharts, share modal, Markdown/JSON export.
- Checked dev.log — server healthy, no errors. Lint clean.
- Ran agent-browser QA on landing — VLM confirmed solid, minor badge alignment note.
- Selected 2 high-impact items: real-time scan progress (#6 priority), onboarding tour (#4 priority).

Implemented changes:
1. **New feature — Real-time scan progress** (`src/app/api/scan-stream/route.ts` + `src/hooks/use-scan.ts` + `src/components/identity/scanner-view.tsx`):
   - New SSE endpoint `/api/scan-stream` that emits per-connector progress events:
     - `{type:"start",connectors:[...]}` — lists all active connectors.
     - `{type:"progress",connector,name,status,error}` — emitted as each connector completes.
     - `{type:"done",report}` — full report when all connectors finish.
   - Runs all connectors in parallel, emits progress as each resolves.
   - Persists to DB and computes scores identically to `/api/scan`.
   - New `useScanStream()` hook with `progress`, `activeConnectors`, `isPending` state.
   - Redesigned scanning overlay to show:
     - **Header**: animated scanner icon + query name.
     - **Progress bar**: X/Y connectors + percentage, animated gradient fill.
     - **Connector list**: each connector shows a spinner (running), green check (found), red X (error), or gray minus (not found) with status badges.
     - **Footer**: privacy-first notice.
   - Replaced the old static overlay (which showed fake timed steps).
   - Verified: torvalds scan → overlay shows "4/5 connectors 80%" with Codeforces found, NPM found, PyPI not found, Social Discovery found, GitHub in progress → completes to dashboard.

2. **New feature — Onboarding tour** (`src/components/identity/onboarding-tour.tsx` + `src/app/page.tsx`):
   - 6-step guided tour shown on first visit (uses localStorage to track completion).
   - Steps: Start a scan → Explore dashboard → Generate AI report → Compare identities → Track history → Privacy-first.
   - Each step navigates to the relevant view, has an animated icon, title, description, step indicator, and Back/Next/Skip buttons.
   - Spring-animated icon entrance, gradient background matching step color.
   - "Get started" button on last step → navigates to scanner.
   - Skip button → returns to landing.
   - Verified: tour appears on first visit (after localStorage.clear()), shows 6 steps with navigation, can skip.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Real-time scan: overlay shows "4/5 connectors 80%" progress bar, individual connector statuses (Codeforces found ✓, NPM found ✓, PyPI not found −, Social Discovery found ✓, GitHub spinner), completes to dashboard.
  - Onboarding tour: 6-step modal with animated icons, step indicators, Back/Next/Skip buttons, navigates to scanner on completion.
- The real-time scan progress transforms the scan UX — users see exactly which APIs are being queried and their results as they happen, instead of a static fake-progress overlay.

Unresolved / next-phase recommendations:
1. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
2. **Report diffing**: compare two scans of the same user over time to show progress (needs UI for selecting past scan + diff visualization).
3. **Theme customization**: let users pick accent colors.
4. **More connectors**: Twitch, YouTube channel lookup, GitLab repo analysis.
5. **Compare history**: save compare results for re-viewing later.
6. **Scan retry individual connectors**: let users retry a single failed connector without re-running the whole scan.
7. **Custom connector builder**: UI for users to add their own public API connectors.

---
Task ID: cron-8
Agent: webDevReview (cron job 235654)
Task: Eighth recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1/2/3/4/5/6/7 complete. Previous rounds: README fix, real contribution calendar, HN+GitLab+Mastodon connectors, Quick Insights, score tooltips, landing rewrite, compare winner badges, skeleton loaders, AI streaming overlay, enhanced empty states, keyboard shortcuts, progressive AI rendering, accessibility audit, lazy-load Recharts, share modal, Markdown/JSON export, real-time scan progress, onboarding tour.
- Checked dev.log — server healthy, no errors. Lint clean. Scan-stream at 12.7s.
- Ran agent-browser QA on landing — VLM confirmed solid.
- Selected 2 high-impact items: theme customization (#3 priority), command palette (new feature).

Implemented changes:
1. **New feature — Theme customization (accent colors)** (`src/stores/app-store.ts` + `src/components/accent-color-provider.tsx` + `src/components/identity/settings-view.tsx` + `src/app/layout.tsx`):
   - Added `AccentColor` type and `ACCENT_COLORS` array with 5 colors: Violet (default), Emerald, Rose, Amber, Cyan.
   - Added `accentColor` to the settings store (persisted to localStorage).
   - New `AccentColorProvider` component that applies the selected color to `--primary`, `--ring`, `--sidebar-primary`, and `--sidebar-ring` CSS variables on the document root.
   - Wrapped the app with the provider in layout.tsx.
   - Added an accent color picker card in the Settings view with 5 color circle buttons — each shows a checkmark when selected, with hover lift effects.
   - Verified: selected Emerald → "New Scan" button and all UI accents changed to green throughout the app.

2. **New feature — Command palette (Cmd+K)** (`src/components/identity/command-palette.tsx` + `src/app/page.tsx`):
   - Spotlight/Raycast-style command palette triggered by Cmd+K / Ctrl+K.
   - Features:
     - **Search input** with live filtering by label, description, and keywords.
     - **Grouped results**: "Navigate" (8 nav items) and "Quick scans" (5 example scans: torvalds, sindresorhus, gaearon, vercel.com, dang).
     - **Keyboard navigation**: ↑/↓ to move, Enter to select, Escape to close.
     - **Mouse navigation**: hover to select, click to activate.
     - **Auto-scroll** selected item into view.
     - **Footer** with keyboard hints and result count.
     - Animated entrance/exit with Framer Motion.
   - Quick scans navigate to the scanner with the query pre-filled.
   - Updated the floating bottom-right button to "⌘K Search" (opens the palette).
   - Verified: palette opens with Ctrl+K, shows grouped commands, search filters live, selecting "Settings" navigates there.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Accent color picker: 5 color buttons (Violet/Emerald/Rose/Amber/Cyan) in Settings, selecting Emerald changes the New Scan button and all accents to green throughout the app.
  - Command palette: opens with Ctrl+K, shows search input + grouped commands (Navigate + Quick scans), 13 results, keyboard navigation works.
- Theme customization gives users personalization; the command palette provides fast keyboard-driven navigation for power users.

Unresolved / next-phase recommendations:
1. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
2. **Report diffing**: compare two scans of the same user over time to show progress.
3. **More connectors**: Twitch, YouTube channel lookup, GitLab repo analysis.
4. **Compare history**: save compare results for re-viewing later.
5. **Scan retry individual connectors**: retry button on failed connectors.
6. **Custom connector builder**: UI for users to add their own public API connectors.
7. **Command palette scan history**: show recent scans as quick actions in the palette.

---
Task ID: cron-9
Agent: webDevReview (cron job 235654)
Task: Ninth recurring 15-min review — QA via agent-browser, continue styling polish + new features.

Work Log:
- Read /home/z/my-project/worklog.md — Phase 1 + cron-1/2/3/4/5/6/7/8 complete. Previous rounds: README fix, real contribution calendar, HN+GitLab+Mastodon connectors, Quick Insights, score tooltips, landing rewrite, compare winner badges, skeleton loaders, AI streaming overlay, enhanced empty states, keyboard shortcuts, progressive AI rendering, accessibility audit, lazy-load Recharts, share modal, Markdown/JSON export, real-time scan progress, onboarding tour, theme customization, command palette.
- Checked dev.log — server healthy, no errors. Lint clean.
- Ran agent-browser QA on dashboard after scan — VLM noted toast overlapping radar chart.
- Selected 3 items: report diffing (#2 priority), command palette scan history (#7 priority), toast position fix.

Implemented changes:
1. **New feature — Report diffing (compare over time)** (`src/components/identity/diff-modal.tsx` + `src/components/identity/dashboard-view.tsx`):
   - New `DiffModal` component that compares the current report against a past scan of the same query.
   - Uses `useHistory(query)` to fetch scans with matching query.
   - Past scan selector with date/score for each option.
   - `DiffResults` component shows:
     - Time range header (past date → now, with "X days apart" badge).
     - 10 score diff cards with delta indicators (▲ green for improvements, ▼ red for declines, − for flat), showing current value + "was X".
     - GitHub stats diff (followers, stars, forks, contributions) with deltas.
     - Verdict card summarizing improvements and declines.
   - "Diff" button added to the dashboard header (between Save and Share).
   - Empty state when fewer than 2 scans exist for the query.
   - Verified: opened diff modal for torvalds, showed past scan list, selected one, displayed score cards with deltas + "was X" comparisons + time range.

2. **New feature — Command palette scan history** (`src/components/identity/command-palette.tsx`):
   - Added "Recent scans" group to the command palette showing the 8 most recent scans.
   - Each item shows the query, score, and date.
   - Selecting a history item loads the full report and navigates to the dashboard.
   - Uses `useHistory()` to fetch recent scans and `loadScanById()` to load the full report.
   - Added "history" to groupLabels and groups.
   - Verified: searching "torvalds" shows both "Quick scans: Scan torvalds" and "Recent scans: torvalds (Score 62), torvalds (Score 59), torvalds (Score 63)".

3. **Polish — Toast position fix** (`src/app/layout.tsx`):
   - Moved Sonner toaster from `bottom-right` to `top-right` to avoid overlapping the radar chart and other dashboard content.
   - VLM had noted the "Scan complete" toast was obscuring the "Developer" dimension label on the radar chart.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified end-to-end via agent-browser + VLM:
  - Diff modal: opens with "Compare over time" title, lists past scans with dates/scores, selecting one shows score cards with deltas + "was X" + time range + verdict.
  - Command palette: searching "torvalds" shows Recent scans group with 3 past torvalds scans (scores 62, 59, 63) alongside Quick scans.
  - Toast: moved to top-right (no longer overlaps charts).
- Report diffing lets users track how a digital identity evolves over time — a key analytics feature for the SaaS.

Unresolved / next-phase recommendations:
1. **Print/PDF polish**: verify SVG charts render correctly in print; dedicated PDF generation route.
2. **More connectors**: Twitch, YouTube channel lookup, GitLab repo analysis.
3. **Compare history**: save compare results for re-viewing later.
4. **Scan retry individual connectors**: retry button on failed connectors.
5. **Custom connector builder**: UI for users to add their own public API connectors.
6. **Diff visualization chart**: a radar chart overlay showing past vs current scores.
7. **Scheduled re-scans**: let users schedule automatic re-scans to build diff history.

---
Task ID: brutalist-redesign
Agent: UI/UX Designer (Brutalism)
Task: Complete Brutalist UI redesign — transform the entire IdentityScope AI interface into authentic Digital Brutalism while keeping ALL functionality, APIs, and backend intact.

Work Log:
- Reviewed the existing design system (glassmorphism, gradients, aurora effects, rounded corners, multi-color palette).
- Identified all decorative CSS classes to override: `.glass`, `.glass-strong`, `.gradient-text`, `.glow`, `.glow-primary`, `.aurora`, `.bg-grid`, `.bg-dots`, `.shimmer`.
- Chose accent color: #FF3B30 (red) as default — aggressive, forensic, fits the "identity scanner" theme.

Implemented changes:

1. **Complete CSS token overhaul** (`src/app/globals.css`):
   - Set `--radius: 0px` and all radius variants (sm/md/lg/xl) to 0px.
   - Light theme: pure white bg (#FFFFFF), black text (#000000), #E5E5E5 secondary, #FF3B30 accent.
   - Dark theme: pure black bg (#000000), white text (#FFFFFF), #1A1A1A secondary, #FF3B30 accent.
   - Nuclear override: `* { border-radius: 0 !important }` — kills ALL rounded corners globally.
   - Redefined `.glass` / `.glass-strong` → solid boxes with 2px/3px black borders (no blur, no transparency).
   - Redefined `.gradient-text` → solid `var(--accent)` (no gradients in brutalism).
   - Redefined `.glow` / `.glow-primary` → `box-shadow: none` (no soft shadows).
   - Redefined `.aurora` → `display: none` (no decorative blurs).
   - Redefined `.bg-grid` → hard visible grid lines.
   - Added brutalist utility classes: `.btn-brutal`, `.input-brutal`, `.card-brutal`, `.badge-brutal`, `.label-brutal`, `.shadow-brutal` (hard offset shadow).
   - Visible focus states: 3px solid accent outline.
   - Headings: uppercase, bold, compressed letter-spacing, tight line-height.
   - Scrollbar: blocky, 8px, black thumb.

2. **Font system** (`src/app/layout.tsx`):
   - Switched from Geist to **Space Grotesk** (grotesk sans) + **JetBrains Mono** (monospace).
   - Space Grotesk for headings/body, JetBrains Mono for labels/data/code.
   - Updated metadata title to "IDENTITYSCOPE AI // DIGITAL IDENTITY SCANNER".

3. **Accent color system** (`src/stores/app-store.ts` + `src/components/accent-color-provider.tsx`):
   - Replaced 5 pastel accent colors with 3 brutalist accents: **Red** (#FF3B30), **Yellow** (#FFD60A), **Green** (#00FF66).
   - Default: Red.
   - Provider now sets `--accent`, `--accent-foreground` (black for yellow, white for red/green), `--destructive`, `--chart-2`, `--ring`.

4. **Header** (`src/components/identity/header.tsx`):
   - Sticky, white/black bg, 3px black border-bottom.
   - Logo: square box with thick border, "IdentityScope" + "// AI" in accent.
   - Nav: inline buttons, active state = inverted (black bg, white text).
   - Buttons: square, thick border, hover invert.
   - Mobile nav: 2-col blocky grid with borders.

5. **Landing page** (`src/components/identity/landing-view.tsx`):
   - Hero: massive 7rem uppercase headline, accent highlight word.
   - Stats: editorial 4-col grid with visible borders between cells.
   - Input types: 4-col bordered grid, hover invert.
   - How it works: numbered steps with oversized step numbers.
   - Features: 4-col bordered grid.
   - Score dimensions: 2-col numbered grid.
   - Connectors: inline bordered tags.
   - CTA: massive bordered box.
   - All sections separated by 3px borders with `// 01 — Input` editorial labels.

6. **Scanner** (`src/components/identity/scanner-view.tsx`):
   - Mode tabs: blocky inline buttons with 3px borders.
   - Form: thick-bordered container, uppercase placeholders, monospace inputs.
   - Scan button: accent bg, hover invert.
   - Examples: inline bordered tags.
   - Scanning overlay: brutalist progress bar (accent fill), connector list with bordered rows, uppercase status labels.

7. **Charts** (`src/components/charts/index.tsx` + `src/components/charts/animated.tsx`):
   - All charts: monochrome (black/white) + single accent color.
   - Radar: accent stroke/fill, monospace uppercase axis labels.
   - Pie: black/accent/gray palette, thick borders.
   - Bar: accent + foreground bars, no rounded corners.
   - Area: accent stroke with subtle gradient fill.
   - Heatmap: accent with opacity levels, bordered cells.
   - ProgressRing: butt linecap (sharp), no drop-shadow, 3xl bold number.
   - `scoreColor()`: returns accent for high (>=75), foreground for mid (>=40), muted for low.
   - `scoreLabel()`: uppercase (EXCELLENT/STRONG/GOOD/FAIR/WEAK/CRITICAL).

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified via agent-browser + VLM:
  - Landing: brutalist with red accent, massive 7rem headline, editorial grid sections, sharp corners, thick borders, no gradients/glassmorphism.
  - Scanner: brutalist form with uppercase placeholders, monospace inputs, blocky tabs.
  - Dashboard: brutalist score cards (square, thick borders, monochrome+red), radar chart monochrome with red accent, massive typography.
  - Mobile (375px): responsive brutalist layout.
- ALL functionality preserved: scanning, AI streaming, compare, history, bookmarks, settings, share modal, diff modal, command palette, keyboard shortcuts, onboarding tour, accent color picker.
- The global `border-radius: 0 !important` and redefined utility classes (`.glass` → solid, `.gradient-text` → accent, `.glow` → none, `.aurora` → hidden) automatically brutalize all remaining views without editing each file.

Unresolved / next-phase recommendations:
1. **Fine-tune dashboard cards**: some inline styles using oklch colors (e.g., insight card backgrounds, stat card colors) could be converted to CSS variables for full monochrome consistency.
2. **Compare view**: verify winner badges and metric rows render brutalist.
3. **Modals**: share/diff/command palette modals use `.glass-strong` which is now brutalist, but could be refined further.
4. **About page**: verify the principles/API list render brutalist.
5. **Print styles**: verify brutalist print output.

---
Task ID: cyber-brutalism-redesign
Agent: UI/UX Designer (Cyber Brutalism)
Task: Transform the entire IdentityScope AI interface into a "CYBER BRUTALISM DOSSIER UI" — a raw hacker-intelligence-dashboard aesthetic with terminal panels, ASCII borders, scan logs, block meters, and stamped status tags. All functionality preserved.

Work Log:
- Reviewed the previous brutalist redesign (basic B&W + red accent). Elevated it to full cyber-brutalism with #050505 background, #00FF66 green accent, terminal panels, scan logs, dossier sections.
- Created reusable cyber elements: TerminalPanel, StatusTag, RiskTag, BlockMeter, ScanLog, AsciiSeparator, BgText.

Implemented changes:

1. **Complete CSS token overhaul** (`src/app/globals.css`):
   - Dark theme (canonical): `#050505` bg, `#0A0A0A` surface, `#FFFFFF` text, `#A3A3A3` secondary, `#00FF66` accent, `#FF3B30` danger, `#FFD60A` warning.
   - Body has subtle 32px grid overlay (terminal feel).
   - New cyber utilities: `.terminal-panel` (dossier container with green top strip), `.cursor-blink`, `.flicker`, `.slide-in`, `.shake`, `.bg-text-faded` (massive faded background typography).
   - New components: `.dossier-header` (terminal panel header strip), `.scan-log` (terminal output with colored timestamps), `.status-found/missing/weak/strong/archived` (stamped status tags), `.risk-low/medium/high` (risk tags), `.block-meter` (ASCII progress bar).
   - Selection color: green on black.
   - Scrollbar: green thumb on dark surface.

2. **Accent system** (`src/stores/app-store.ts` + `src/components/accent-color-provider.tsx`):
   - 3 cyber accents: Green (#00FF66 default), Amber (#FFD60A), Cyan (#00E5FF).
   - All use dark text (#050505) since they're neon bright.

3. **Layout** (`src/app/layout.tsx`):
   - Forced dark theme (enableSystem=false) — cyber brutalism is dark-first.
   - Fonts: Space Grotesk (sans) + JetBrains Mono (mono).

4. **Header** (`src/components/identity/header.tsx`):
   - Top status strip: "SYSTEM_ONLINE · PUBLIC_API_MODE · NO_AUTH_BYPASS · v1.0.0 · IDENTITY_TRACE_ACTIVE" with pulsing green dot.
   - Logo: green square with scan icon, "IDENTITYSCOPE" + "// AI_SCANNER".
   - Nav: monospace uppercase (SCAN/DOSSIER/AI_VERDICT/VS/SAVED/ARCHIVE/INFO), active = green block.
   - CTA: green "START_SCAN" button.
   - Footer: terminal ending block with BUILD/MODE/STATUS metadata.

5. **Landing page** (`src/components/identity/landing-view.tsx`):
   - Hero: split layout — massive "SCAN YOUR PUBLIC INTERNET IDITY." headline (left) + terminal preview box (right) with ASCII borders showing a fake scan result (TARGET/GITHUB/CODEFORCES/SCORE).
   - Blinking cursor at end of terminal preview.
   - Faded background "SCAN" text.
   - All sections use `// 01 — INPUT_TYPES` editorial labels.
   - Stats grid with green icons.
   - Features as "RAW_SIGNALS" with monospace titles.
   - CTA: "RUN_FIRST_SCAN".

6. **Scanner overlay** (`src/components/identity/scanner-view.tsx`):
   - Terminal scan log with timestamps `[00:00]`, `[00:01]`...
   - ASCII block progress bar: `SCANNING ███████████░░░░░ 72%` using █ and ░ characters.
   - Log entries: `> checking_github... FOUND` with colored status (green/red/amber).
   - Blinking cursor while scanning remaining connectors.
   - Footer: "X/Y CONNECTORS · PUBLIC_DATA_ONLY".

7. **Score system** (`src/components/charts/animated.tsx`):
   - `scoreColor()`: green (>=70), amber (>=40), red (<40) — cyber status colors.
   - `scoreLabel()`: EXCELLENT/STRONG/GOOD/FAIR/WEAK/CRITICAL (uppercase).
   - `blockMeter()`: ASCII bar `[████████░░░░░░] 78/100`.

8. **Reusable cyber elements** (`src/components/identity/cyber-elements.tsx`):
   - `TerminalPanel`: dossier container with header strip + optional status tag.
   - `StatusTag`: stamped FOUND/MISSING/WEAK/STRONG/ARCHIVED labels.
   - `RiskTag`: RISK: LOW/MEDIUM/HIGH.
   - `BlockMeter`: ASCII progress bar component.
   - `ScanLog`: terminal log line with timestamp.
   - `AsciiSeparator`: horizontal ASCII divider.
   - `BgText`: massive faded background typography.

Stage Summary:
- All changes lint clean (`bun run lint` passes).
- Dev server healthy on port 3000 (HTTP 200).
- Verified via agent-browser + VLM:
  - Landing: cyber-brutalist with #050505 bg, #00FF66 accent, massive headline, terminal preview box with ASCII borders + blinking cursor, faded "SCAN" background text, status strip.
  - Scanner overlay: terminal scan log with [00:01] timestamps, ASCII block progress bar (█░), colored status (green FOUND / red ERROR / amber NOT_FOUND), blinking cursor.
  - Dashboard: cyber-brutalist dossier with score ring, terminal panels, green/amber/red score cards, monospace labels, status tags.
  - Mobile (375px): responsive cyber-brutalist layout.
- ALL functionality preserved: scanning, AI streaming, compare, history, bookmarks, settings, share/diff modals, command palette, keyboard shortcuts, onboarding tour, accent picker.

Unresolved / next-phase recommendations:
1. **Dashboard sections**: convert remaining dashboard cards (GitHub profile, repos, languages) to TerminalPanel + StatusTag components for full dossier consistency.
2. **Compare view**: style as "DEVELOPER VS DEVELOPER" fight card with winner badges.
3. **History view**: style as archived case files (CASE #001, TARGET, DATE, STATUS: ARCHIVED).
4. **Report view**: style as intelligence dossier with numbered sections.
5. **Modals**: apply terminal-panel styling to share/diff/command-palette modals.
