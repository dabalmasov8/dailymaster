# DailyMaster

Your FREE daily standup meeting assistant. A Progressive Web App (PWA) that streamlines daily standups and newcomer introductions.

## Features

- **Daily Standup Flow** -- Timer-based speaker rotation with default or shuffled order, blocker/capacity tracking, copy results to clipboard
- **Newcomer Intro** -- "Welcome on board!" flow for introducing new team members with customizable icebreaker questions
- **Settings** -- Manage participants, standup questions, newcomer intro questions, and per-speaker duration
- **Keyboard Shortcuts** -- D/S to start, B/C/N/V during standup, N for newcomer flow
- **PWA** -- Installable on mobile (iOS homescreen, Android), works offline
- **Responsive** -- Desktop 3-column layout, stacked on mobile/tablet

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui v4
- **Auth**: Clerk
- **Database**: Vercel Postgres (Neon) + Prisma v7
- **PWA**: @serwist/next
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account (free tier)
- A [Neon](https://neon.tech) or Vercel Postgres database (free tier)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/dabalmasov8/dailymaster.git
   cd dailymaster
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   DATABASE_URL=postgresql://...
   ```

5. Generate the Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```

### Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
src/
  app/
    (app)/              -- Authenticated app routes
      standup/           -- Daily standup flow
      newcomer/          -- Newcomer intro flow
      settings/          -- Settings pages (participants, standup, newcomer)
    sign-in/             -- Clerk sign-in
    sign-up/             -- Clerk sign-up
    layout.tsx           -- Root layout with PWA meta, Clerk provider
    globals.css          -- Design tokens (oklch colors, radii, fonts)
  components/
    layout/              -- AppHeader, NavLink, SettingsSidebar
    ui/                  -- shadcn + custom components
    providers/           -- ClerkProvider, ThemeProvider
  lib/                   -- db.ts, auth.ts, utils.ts, validations.ts
  types/                 -- Shared TypeScript interfaces
prisma/
  schema.prisma          -- Database schema
```

## Keyboard Shortcuts

### Standup Start Screen
| Key | Action |
|-----|--------|
| D   | Start with default order |
| S   | Start with shuffled order |

### Standup In Progress
| Key | Action |
|-----|--------|
| B   | Mark current speaker as having a blocker |
| C   | Mark current speaker as having capacity |
| N   | Next speaker |
| V   | End standup |

### Newcomer Intro
| Key | Action |
|-----|--------|
| N   | Next speaker |

## License

MIT
