# DailyMaster

A free PWA for running daily standup meetings and newcomer introductions. Timer-based speaker rotation, blocker tracking, keyboard shortcuts — installable on any phone, no app store needed.

**From Figma designs to deployed PWA: ~1 day.**

---

## Why I built this

Standups without structure are chaos in slow motion.

No one wants to speak first. When someone finishes, they look around the room — or the grid of tiny video rectangles — searching for a face that hasn't spoken yet. Half the team is multitasking, so they pick the person who already reported. "Oh, I went already." Awkward pause. Someone else jumps in. You lose 30 seconds every single transition, times 15 people, every single day.

Then there's the blocker problem. The question is simple: "Do you have any blockers?" The correct answer is "Yes, ticket X, I need Anna and Max to stay after standup." But what actually happens is someone shares their screen, opens a Jira ticket, starts explaining a database migration to 14 people who have zero context, and suddenly your 15-minute standup is a 40-minute debugging session. Everyone is too polite to interrupt. Everyone is silently furious.

I looked for a free tool that solves this. A timer that auto-rotates speakers so nobody has to pick. A one-click blocker flag so people say "blocker" instead of launching a screen share. A clipboard export so the scrum master can paste the summary into Slack without taking notes. The tools I found were either $8/user/month enterprise products or features buried inside project management platforms that nobody opens just for a 15-minute meeting.

And then there's the newcomer problem. Someone joins the team, and the best we can do is "introduce yourself." The new person gives a rehearsed elevator pitch, everyone nods politely, and nobody learns anything real. What if instead you asked "Do pineapples belong on pizza?" or "What's a hill you'll die on that most people disagree with?" Suddenly people are laughing, arguing, and the new person actually gets to see who their teammates are — not just their job titles.

I wanted something that does one thing well: run a standup. Open it, press D, talk. The keyboard shortcuts matter — the person running the standup shouldn't be clicking buttons while the team is talking. When it's over, one click copies the blocker list. The newcomer flow gives structure to what is otherwise the most awkward 5 minutes of someone's first week.

This is the third attempt. The first was Flask (too much backend for a frontend problem), the second was Next.js without a clear design (scope creep killed it). This time I started with Figma, wrote user stories first, and kept the scope tight.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 | Server components for fast initial load, server actions for mutations without API routes |
| Language | TypeScript | — |
| Styling | Tailwind CSS v4 + shadcn/ui v4 | CSS-based config (no `tailwind.config.ts`), oklch color format for perceptual uniformity |
| Auth | Clerk | Free tier, 10k MAU, handles OAuth/email/password with zero custom auth code |
| Database | Neon (serverless Postgres) | Free tier, serverless driver for edge compatibility, connection pooling built in |
| ORM | Prisma v7 | Type-safe queries, JSON field support for flexible schema |
| PWA | @serwist/next | Maintained fork of next-pwa, supports App Router and service worker precaching |
| Font | Blackout Midnight | Display font for timer and welcome heading — adds visual weight |
| Hosting | Vercel | Free tier, auto-deploys on push, edge network, native Next.js support |

**Total monthly cost: $0.** Every service is on its free tier. No credit card required for any of them.

---

## Architecture

The app has three main flows, all behind Clerk authentication.

```
User opens the app
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│  Clerk Authentication                                    │
│  Route-based middleware protects all /app routes.         │
│  First login creates a User record in Neon with          │
│  default standup questions and empty participant list.    │
└─────────────────────────────────────────────────────────┘
        │
        ├──────────────────┬──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  /standup     │  │  /newcomer   │  │  /settings/*     │
│              │  │              │  │                  │
│  Idle screen  │  │  Welcome     │  │  Participants    │
│  D or S key   │  │  on board!   │  │  Questions       │
│      │        │  │  N key       │  │  Duration        │
│      ▼        │  │  cycles      │  │  Newcomer Qs     │
│  Timer runs   │  │  speakers    │  │                  │
│  B/C/N/V keys │  │              │  │  Server Actions  │
│  tracks       │  │              │  │  + Zod validation│
│  blockers &   │  │              │  │  + optimistic UI │
│  capacity     │  │              │  │                  │
│      │        │  │              │  │                  │
│      ▼        │  │              │  │                  │
│  Copy results │  │              │  │                  │
│  to clipboard │  │              │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
```

### Data model

One table. Everything lives in JSON fields — no joins, no migrations when the shape changes.

```prisma
model User {
  id                      String   @id @default(cuid())
  clerkId                 String   @unique
  teamMembers             Json     @default("[]")   // [{id, name, position}]
  questions               Json     @default("[]")   // [{id, text}]
  newcomerIntroQuestions   Json     @default("[]")   // [{id, text}]
  standupDurationMinutes  Int      @default(2)
  standupDurationSeconds  Int      @default(0)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

### State management

The standup session uses `useReducer` with a state machine — no external state library, no persistence. The meeting state is ephemeral: refresh the page and it resets to idle. This is intentional — a standup is a 15-minute event, not a document.

```
States:  idle ──▶ active ──▶ complete
Actions: START_DEFAULT, START_SHUFFLED, TICK, NEXT_SPEAKER,
         MARK_BLOCKER, MARK_CAPACITY, END_STANDUP
```

---

## What I learned building this

### Problem → Solution log

**Prisma v7 JSON fields reject typed arrays on write**
Prisma v7 generates strict `InputJsonValue` types. Writing `teamMembers: members` where `members` is `TeamMember[]` fails at compile time — the type is not assignable to `InputJsonValue`.
→ Created a `toJson()` helper: `JSON.parse(JSON.stringify(data))`. Strips the TypeScript type and produces a plain JSON value that Prisma accepts. The same pattern is needed for reads: `user.teamMembers as unknown as TeamMember[]`.

**manifest.json blocked by Clerk middleware**
The middleware matcher regex `js(?!on)` was designed to exclude `.js` files but allow `.json`. In practice, `manifest.json` was still being intercepted by Clerk, returning a login redirect instead of the manifest. PWA install failed silently.
→ Added `/manifest.json`, `/sw.js`, and `/icons/(.*)` explicitly to the `isPublicRoute` matcher. The regex was correct in theory but fragile in practice — explicit routes are clearer.

**Standup page crashed during Next.js prerender**
`getOrCreateUser()` calls Clerk's `auth()` at build time, which fails because there is no user session during static generation. The error was cryptic: `a[d] is not a function`.
→ Added `export const dynamic = "force-dynamic"` to pages that depend on auth. These pages can never be statically generated — they always need the current user.

**Stale webpack cache after dependency changes**
After updating packages, the build would fail with `Cannot find module './611.js'` — a phantom chunk from a previous build.
→ Delete both `.next/` and `node_modules/.cache/` when this happens. Added `.next/` to `.gitignore` so it never gets committed.

**Tailwind CSS v4 uses CSS-based config, not JS**
Tailwind v4 dropped `tailwind.config.ts` entirely. Custom theme values (colors, radii, fonts) go in `globals.css` inside a `@theme inline {}` block. The oklch color format replaces HSL — perceptually uniform, so `oklch(0.682 0.173 53.05)` is the orange that actually looks like the Figma design, not "close enough."

**shadcn/ui v4 migrated to @base-ui/react**
shadcn/ui v4 dropped Radix primitives for `@base-ui/react`. The import paths and component APIs changed. Old shadcn tutorials and examples don't apply — had to follow the v4-specific docs.

---

## Keyboard shortcuts

Shortcuts are handled by a global `keydown` listener that ignores events when focus is in an input or textarea.

### Standup start screen

| Key | Action |
|-----|--------|
| D   | Start with default speaker order |
| S   | Start with shuffled speaker order |

### Standup in progress

| Key | Action |
|-----|--------|
| B   | Mark current speaker as having a blocker |
| C   | Mark current speaker as having capacity to help |
| N   | Next speaker |
| V   | End standup |

### Newcomer intro

| Key | Action |
|-----|--------|
| N   | Next speaker |

---

## Repo structure

```
dailymaster/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Authenticated routes
│   │   │   ├── standup/              # Daily standup flow (useReducer state machine)
│   │   │   ├── newcomer/             # Newcomer intro flow
│   │   │   └── settings/             # Participants, questions, duration
│   │   │       └── actions.ts        # Server actions — all CRUD mutations
│   │   ├── sign-in/                  # Clerk sign-in
│   │   ├── sign-up/                  # Clerk sign-up
│   │   ├── layout.tsx                # Root layout — PWA meta, Clerk, Analytics
│   │   └── globals.css               # Design tokens (oklch), @font-face, radii
│   ├── components/
│   │   ├── layout/                   # AppHeader, NavLink, SettingsSidebar
│   │   └── ui/                       # shadcn + timer, shortcuts, editable list
│   ├── lib/                          # db.ts, auth.ts, utils.ts, validations.ts
│   └── types/                        # TeamMember, Question interfaces
├── prisma/
│   └── schema.prisma                 # Single User table with JSON fields
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── icons/                        # PWA icons (192px, 512px)
│   └── fonts/                        # Blackout Midnight display font
└── package.json
```

---

## Running locally

```bash
# Clone and install
git clone https://github.com/dabalmasov8/dailymaster.git
cd dailymaster
npm install

# Create .env
cp .env.example .env
# Fill in:
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
#   CLERK_SECRET_KEY=sk_test_...
#   DATABASE_URL=postgresql://...

# Set up the database
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Set environment variables (first time)
echo "pk_test_..." | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "sk_test_..." | vercel env add CLERK_SECRET_KEY production
echo "postgresql://..." | vercel env add DATABASE_URL production

# Redeploy with env vars
vercel --prod
```

Add your Vercel production URL to Clerk's allowed origins in the Clerk dashboard.

---

## Cost

| Item | Cost |
|---|---|
| Vercel hosting (Hobby plan) | $0/month |
| Neon database (free tier, 0.5 GB) | $0/month |
| Clerk auth (free tier, 10k MAU) | $0/month |
| Custom domain (optional) | ~$12/year |
| **Total** | **$0/month** |

---

*Personal project — not a product.*
*Owner: Dmytro Abalmasov*
