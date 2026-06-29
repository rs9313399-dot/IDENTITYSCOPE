# IDENTITYSCOPE

IDENTITYSCOPE is a Next.js digital identity intelligence dashboard that scans public developer, website, email, and social signals and turns them into a structured profile report.

The project is designed for portfolio audits, developer research, public profile analysis, and documentation-quality scoring.

## Highlights

- Scan a GitHub handle, username, website URL, or email address.
- Combine public API signals into one digital identity report.
- Analyze GitHub repositories, languages, contribution activity, README quality, and repository health.
- Inspect websites for SEO, accessibility, performance, tech stack, and security headers.
- Verify email format, disposable-domain status, and MX records.
- Discover social profiles across multiple developer and publishing platforms.
- Generate AI-assisted recommendations, career suggestions, resume tips, and learning roadmaps.
- Compare two public developer profiles side by side.
- Save scan history, bookmark important reports, and export Markdown or JSON summaries.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS, Radix UI, shadcn/ui patterns |
| Data | Prisma, SQLite |
| State and data fetching | Zustand, TanStack Query |
| Motion and charts | Framer Motion, Recharts |
| AI/reporting | AI report route and public-signal scoring engine |

## Project Structure

```text
IDENTITYSCOPE/
├── prisma/                # Database schema
├── src/app/api/           # Scan, report, history, compare, and connector routes
├── src/components/identity/
│   ├── landing-view.tsx
│   ├── scanner-view.tsx
│   ├── dashboard-view.tsx
│   ├── report-view.tsx
│   └── compare-view.tsx
├── src/lib/apis/          # GitHub, website, package, email, and social connectors
├── src/lib/scoring.ts     # Public-signal scoring logic
└── src/stores/            # App state
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- SQLite-compatible local database

### Installation

```bash
git clone https://github.com/rs9313399-dot/IDENTITYSCOPE.git
cd IDENTITYSCOPE
bun install
```

Create an environment file:

```bash
cp .env.example .env
```

If no example file is available, create `.env` and add:

```env
DATABASE_URL="file:./dev.db"
```

Then initialize Prisma:

```bash
bun run db:generate
bun run db:push
```

Run the development server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the local Next.js app |
| `bun run build` | Generate Prisma client and build the production app |
| `bun run start` | Start the standalone production server |
| `bun run lint` | Run lint checks |
| `bun run db:push` | Sync Prisma schema to the local database |

## Notes

- Scans depend on public data availability and third-party API limits.
- AI-generated recommendations should be reviewed before being used in professional documents.
- Add API keys in `.env` only when a connector route requires them.

## Author

Built by [Ratnesh Singh](https://github.com/rs9313399-dot).

