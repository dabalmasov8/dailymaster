# DailyMaster

A free app for running daily standup meetings and newcomer introductions. It works in the browser, and you can install it on your phone's home screen — no app store needed.

**From design to working app: ~1 day.**

---

## Why I built this

Standups without structure are chaos in slow motion.

No one wants to speak first. When someone finishes, they look around the room — or the grid of tiny video rectangles — searching for a face that hasn't spoken yet. Half the team is multitasking, so they pick the person who already reported. "Oh, I went already." Awkward pause. Someone else jumps in. You lose 30 seconds every single transition, times 15 people, every single day.

Then there's the blocker problem. The question is simple: "Do you have any blockers?" The correct answer is "Yes, ticket X, I need Anna and Max to stay after standup." But what actually happens is someone shares their screen, opens a task tracker, starts explaining a technical problem to 14 people who have zero context, and suddenly your 15-minute standup is a 40-minute discussion. Everyone is too polite to interrupt. Everyone is silently furious.

I looked for a free tool that solves this. A timer that moves to the next speaker automatically so nobody has to pick. A one-click blocker flag so people say "blocker" instead of launching a screen share. A way to copy the summary and paste it into the team chat without taking notes. The tools I found were either $8/user/month enterprise products or features buried inside project management platforms that nobody opens just for a 15-minute meeting.

And then there's the newcomer problem. Someone joins the team, and the best we can do is "introduce yourself." The new person gives a rehearsed elevator pitch, everyone nods politely, and nobody learns anything real. What if instead you asked "Do pineapples belong on pizza?" or "Is cereal a soup?" Suddenly people are laughing, arguing, and the new person actually gets to see who their teammates are — not just their job titles.

I wanted something that does one thing well: run a standup. Open it, press a key, talk. The app supports keyboard shortcuts — single key presses that control the meeting — so the person running the standup doesn't need to reach for the mouse while the team is talking. When it's over, one click copies the blocker list. The newcomer flow gives structure to what is otherwise the most awkward 5 minutes of someone's first week.

This is the third attempt. The first two didn't get far — wrong tools, no clear design, scope creep. This time I started with visual designs in Figma (a design tool), wrote user stories first, and kept the scope tight.

---

## How it works

### Step 1 — Sign up and set up your team

You create an account (email or Google sign-in). The first time you log in, the app creates your workspace with default standup questions already filled in. You go to Settings and add your team members — their names and roles.

### Step 2 — Customise your standup

In Settings, you can change the questions your team answers during standup, set how long each person gets to speak (for example, 2 minutes), and add icebreaker questions for newcomer introductions.

### Step 3 — Run a standup

Open the Daily Standup page. Choose the speaker order — either the default list or a random shuffle. The timer starts counting down for the first speaker. When their time is up, it moves to the next person automatically.

During someone's turn, you can mark them as having a **blocker** (something that is stopping their work) or **capacity** (they have free time to help others). These names collect in a sidebar so you don't forget them.

When the standup is done, press "Copy to clipboard" — it creates a formatted summary of who has blockers and who has capacity, ready to paste into Slack, Teams, or any team chat.

All of this can be controlled with keyboard shortcuts: single key presses like D (start with default order), S (shuffle), B (mark blocker), N (next speaker). No clicking needed — the person running the meeting can keep their hands on the keyboard.

### Step 4 — Welcome a newcomer

Open the Newcomer Intro page. Each team member takes a turn answering the icebreaker questions you set up — things like "Do pineapples belong on pizza?" or "What is the worst advice you've ever received?" The flow cycles through each person one by one.

### Step 5 — Install on your phone

Since DailyMaster is a PWA (Progressive Web App — a website that behaves like a native app), you can add it to your phone's home screen. On iPhone, tap the share button in Safari and choose "Add to Home Screen." It opens full-screen without the browser address bar, just like a regular app.

---

## UX details I'm proud of

**Empty state that guides you.** When you open the standup page with no team members added, the app doesn't just show a disabled button. It shows a clear message — "Add participants in Settings first" — where "Settings" is styled as a clickable link that takes you directly to the right page. Small thing, but it means a new user never gets stuck wondering "what do I do next?"

**Timer auto-advances.** When a speaker's time runs out, the app moves to the next person automatically. No one has to click "next" — the meeting keeps flowing. If someone finishes early, one key press skips ahead.

**Copy standup notes.** After the standup, one button creates a formatted summary with the date, blockers, and capacity. It sits in a visually separated card above the lists — distinct from the action buttons — and shows a "Copied!" confirmation with a brief animation so you know it worked. Paste it into your team chat. No note-taking during the meeting.

**Keyboard shortcuts for everything.** Six keys control the entire standup: D, S, B, C, N, V. The person running the meeting never has to reach for the mouse.

**Delete with undo.** Deleting a participant or question doesn't happen instantly. The row transforms into a "Deleted — Undo (5s)" bar with the name struck through and a countdown. After 5 seconds, it slides out with an animation and the deletion is final. This pattern prevents accidental data loss — no confirmation dialogs that interrupt your flow, but a safety net when you need it.

**Inline edit with autosave.** No pencil icons, no "edit mode." Every field in Settings is always editable — just click and type. Changes save automatically after 600 milliseconds of inactivity, or immediately when you click away. If you clear a field and leave, it reverts to the previous value instead of saving an empty string. This removes an entire layer of UI (edit buttons, save buttons, cancel buttons) without losing any functionality.

**Button visual hierarchy.** During a standup, three actions compete for attention: marking a blocker (urgent, red), marking capacity (important, navy), and moving to the next speaker (routine, outlined). The colour hierarchy makes the destructive action (blocker) visually distinct from the routine one (next). The "Copy standup notes" button uses the primary orange — separate from all action buttons — so it reads as a utility, not a meeting control.

**Responsive mobile-first design.** The app was designed for desktop first (Figma), then reworked for mobile PWA. Header collapses into a hamburger menu with 44px WCAG touch targets. Settings tabs become a segmented control with icons. Standup questions and action buttons stack vertically. Keyboard shortcut hints are hidden on mobile since they don't apply. The "Copy standup notes" button is positioned above the blockers/capacity lists so it's not blocked by the iPhone home bar gesture area.

**Multiline question editing.** Standup and newcomer questions use auto-resizing text areas instead of single-line inputs. Long questions like "If you could have dinner with anyone, living or dead, who would it be?" are fully visible while editing — no truncation, no horizontal scrolling.

**35 built-in icebreaker questions.** The newcomer settings page has an "Add a random icebreaker" button with a spinning animation. It pulls from a curated pool of 35 questions — a mix of food debates, hypothetical scenarios, and personality questions. The pool filters out questions you've already added, so you never get duplicates.

**Consistent design tokens.** Every border radius, colour, and spacing value comes from a shared set of CSS variables. Four radius values across the entire app: 6px for inputs, 8px for buttons, 12px for cards, 20px for pills. This means every element looks like it belongs to the same design system, even though many were built at different times.

---

## Stack

| What | Technology | Why |
|---|---|---|
| App framework | Next.js 15 + React 19 | Fast page loads, built-in support for the hosting platform |
| Language | TypeScript | JavaScript with type checking — catches bugs before they reach users |
| Design system | Tailwind CSS + shadcn/ui | Pre-built components that match the visual design, easy to customise |
| User accounts | Clerk | Free for up to 10,000 users, handles login and sign-up with no custom code |
| Database | Neon (cloud PostgreSQL database) | Free tier, stores all user data — team members, questions, settings |
| Database toolkit | Prisma | Translates between the app code and the database safely |
| Installable app | @serwist/next | Makes the website installable on phones as a home screen app |
| Display font | Blackout Midnight | Bold font used for the timer and welcome heading |
| Hosting | Vercel | Free tier, automatically publishes new versions when code is updated |

**Total monthly cost: $0.** Every service is on its free tier. No credit card required.

---

## Cost

| Item | Cost |
|---|---|
| Vercel hosting | $0/month |
| Neon database (free tier, 0.5 GB storage) | $0/month |
| Clerk user accounts (free tier, up to 10,000 users) | $0/month |
| Custom domain (optional) | ~$12/year |
| **Total** | **$0/month** |

---

*Owner: Dmytro Abalmasov*
