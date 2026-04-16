# Setup Guide

## Requirements

- **Node.js 18.17+** (required by Next.js 14)
- **npm 9+** or **pnpm 8+** or **yarn 1.22+**

> The app ships with Node.js engine constraint `"node": ">=18.17.0"`.  
> If you have Node 14/16, install Node 18 first via [nvm](https://github.com/nvm-sh/nvm) or [Volta](https://volta.sh/).

---

## Quick Start (zero config)

The app runs fully without any API keys. AI will produce a mock report; data persists locally.

```bash
# 1. Clone or navigate to the project directory
cd "Prompt to Production"

# 2. Install dependencies
npm install

# 3. Copy env file (all values optional)
cp .env.example .env.local

# 4. Start the dev server
npm run dev

# 5. Open in browser
open http://localhost:3000

# 6. Visit the demo report
open http://localhost:3000/demo
```

---

## Environment Variables

All variables are optional. The app gracefully falls back when they're not set.

### AI Providers

Set at least one to get real AI-generated reports.

```bash
ANTHROPIC_API_KEY=sk-ant-...    # Priority 1: Anthropic (claude-sonnet-4-6)
OPENAI_API_KEY=sk-...           # Priority 2: OpenAI (gpt-4o)
```

If neither is set, the app returns a mock report with a visible banner.

### Database

If not set, data is stored in `.local-data/` JSON files.

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Used for server-side writes
```

To set up Supabase:
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor
3. Copy the project URL and keys to your `.env.local`

### Performance

```bash
PAGESPEED_API_KEY=AIza...   # Google PageSpeed Insights API key
```

Get a key from [Google Cloud Console](https://console.cloud.google.com/).
If not set, heuristic signals derived from HTML analysis are used instead.

### Screenshots

```bash
SUPABASE_STORAGE_BUCKET=prompt-to-prod-screenshots
```

Screenshots require Playwright to be installed:

```bash
npm install playwright
npx playwright install chromium
```

If Playwright is not installed, screenshots are silently skipped.

### Rate Limiting & App URL

```bash
SCAN_RATE_LIMIT_PER_HOUR=5        # Default: 5 scans per IP per hour
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Used for share URLs
APP_ENV=development
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── scan/[id]/page.tsx      # Scan progress page
│   ├── report/[id]/page.tsx    # Report display page
│   ├── dashboard/page.tsx      # Recent scans list
│   ├── demo/page.tsx           # Loads demo report
│   ├── contact/page.tsx        # Contact placeholder
│   └── api/
│       └── scan/               # Scan API routes
├── components/
│   ├── ui/                     # Reusable UI primitives
│   ├── report/                 # Report-specific components
│   ├── scan/                   # Scan progress components
│   └── landing/                # Landing page components
├── lib/
│   ├── schemas/                # Zod schemas
│   ├── rateLimit.ts            # In-memory rate limiter
│   └── utils.ts                # Shared utilities
└── server/
    ├── ai/                     # AI provider + prompts (server-only)
    ├── db/                     # Database client + local store (server-only)
    ├── scan/                   # Scan pipeline stages (server-only)
    ├── data/seed/              # Demo report seed data
    └── mobile/                 # Phase 2 scaffolding (server-only)

supabase/migrations/            # SQL migrations
docs/                           # Documentation
.local-data/                    # Local JSON store (gitignored, auto-created)
public/screenshots/             # Screenshots (gitignored)
```

---

## Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript type check (no emit)
```

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel dashboard (Project → Settings → Environment Variables).

**Important:** On Vercel's hobby tier, serverless functions have a 10-second timeout.
The scan pipeline can take 20–60 seconds. Upgrade to Pro for 60s timeouts, or use
Vercel's background functions / Edge Runtime for longer scans.

### Other platforms

The app is a standard Next.js application. It runs on any Node.js 18+ server.
Set `NEXT_PUBLIC_APP_URL` to your production domain.

---

## Local Data Store

When Supabase is not configured, data is saved to `.local-data/`:

```
.local-data/
├── scans.json
└── reports.json
```

This directory is gitignored. Delete it to reset all local data.
It is created automatically on first scan.
