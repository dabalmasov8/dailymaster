# DailyMaster

A free app for running daily standup meetings and newcomer introductions. It works in the browser, and you can install it on your phone's home screen — no app store needed.

**Live at [dailymaster.online](https://dailymaster.online). From design to working app: ~1 day.**

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

## V2 — From meeting tool to team memory

V1 solved the meeting itself: a timer, an order, a way to flag blockers, a way to copy the summary out. What it didn't solve is that the moment the meeting ended, everything about it disappeared. Blockers evaporated. Nobody could say whether the standup was getting shorter or longer over a month. "Waiting on Anna" from Tuesday had no way of becoming "resolved" by Friday. V1 ran the meeting; it didn't remember it.

V2 is about giving the standup a memory, scoped deliberately to the pieces that turn into real product signal — not every idea that came up while brainstorming a future MCP integration.

**What shipped:**

- **Attendance tracking.** A "Who's here today?" chip row before you start — tap a name to mark them absent. Absent people are skipped in the rotation and it's logged, so "who keeps missing standup" becomes an answerable question instead of a hunch.
- **Session logging.** Every standup now records its start time, end time, speaking order, and how long each person actually took versus their allotted time. This is what makes "our standups are getting longer" a fact instead of a feeling.
- **Blockers with a lifecycle.** A blocker used to be a name in a sidebar for 15 minutes and then nothing. Now each one gets an optional note, persists past the meeting, and moves through New → In progress → Resolved / Won't fix on a dedicated board. A blocker is now a thing you can close, not just a thing you can mention.
- **Capacity offers with a claim.** "Roy has capacity to help" was pure goodwill with no follow-through mechanism. Now each offer can be marked claimed, so capacity utilization — how much of the offered help actually gets used — is a real, visible number instead of an assumption.
- **The Insights page.** Everything above rolls up into one view: average standup duration and its trend, who tends to run over their allotted time, who's been absent most, the blocker board, and capacity utilization. This is also the data foundation for the MCP server — the next milestone — so an assistant can eventually answer "what's still blocking us" or "how has standup length trended" by querying this same data instead of me building a bespoke report for every question.

**Deliberately cut from this milestone:**

- **Newcomer answer history.** Logging what each newcomer says to the icebreaker questions (to build a searchable "who is this person" memory) is a genuinely good idea, but it's a different feature surface — newcomer intros, not standups — and bundling it in would have diluted this milestone's actual focus: making the *daily* ritual accountable. Revisit later.
- **Cross-session blocker dependency tagging** ("waiting on Team X"). This only matters once there's real multi-team usage to observe. Building it now would be designing for a scenario I haven't seen yet — premature structure for a problem that doesn't exist in the data.

The discipline here is the same one from V1: define scope before writing code, and say no to good ideas that don't serve the milestone.

---

## V2.1 — An MCP server for the data

V2 built the data; V2.1 makes it queryable by an AI assistant instead of only by the Insights page.

**What shipped:**

- **A hosted MCP server at `/api/mcp`.** Any MCP-compatible client — Claude Desktop, Claude.ai custom connectors, or anything else that speaks the protocol — can connect and ask questions about a team's standups.
- **Personal access tokens, not shared credentials.** Since DailyMaster is multi-tenant (every Clerk user has their own team and data), the MCP server needs to know who's asking. Settings → MCP lets you generate a token, shown once at creation, hashed before it's stored — the same pattern GitHub, Linear, and most developer tools use for this exact problem. Revoking a token is immediate, no confirmation dialog, because the entire point of revocation is speed if a token leaks.
- **Seven tools, read-heavy, one write.** `list_team_members`, `list_standups`, `get_standup_stats` (with trend vs. the previous period), `list_blockers`, `list_capacity_offers`, and `get_team_digest` are read-only. `update_blocker_status` is the one write tool — it means an assistant can actually resolve a blocker conversationally ("mark the design-review blocker as resolved"), not just report on it.
- **Stateless by design.** Every request creates a fresh `McpServer` instance scoped to whichever user the token belongs to, then discards it. No session state to leak between users, no in-memory cache to get stale — a good fit for a serverless deployment where any request can land on a different instance.

**What I got wrong on the first pass, and how I found it:** I didn't just write this and ship it — I ran it against a real seeded account before calling it done, and found two bugs that would have made the whole thing silently fail in production:

1. **Clerk's own middleware was blocking the route before my code ever ran.** DailyMaster protects every route by default and only exempts an explicit allowlist. `/api/mcp` authenticates itself via Bearer token, not a Clerk session — but I'd forgotten to add it to that allowlist, so Clerk's `auth.protect()` rejected every request before my token check even executed. A request with a *valid* token would have failed identically to one with no token at all. This only shows up when you test the authenticated path, not just the unauthenticated one.
2. **The transport was returning empty responses.** The MCP SDK defaults to Server-Sent Events for its responses, and my first version explicitly closed the transport immediately after getting the `Response` object back — which cut the stream before it had actually flushed the reply. The fix was two lines: set `enableJsonResponse: true` (our tools are simple request/response, no server-initiated streaming needed) and stop closing the transport early. Both bugs returned HTTP 200 — nothing about the status code would have told you something was wrong. Only calling the real endpoint with a real token surfaced it.

**Deliberately cut from this milestone:** OAuth-based auth (so a client could connect without manually copying a token) and MCP resources/prompts beyond tools. Personal access tokens are the smaller, well-understood piece that gets a working connector shipped now; OAuth is worth doing once there's a reason more demanding than "slightly nicer setup."

---

## How it works

### Step 0 — The landing page knows you

Visiting the site logged out shows a marketing page — orange brand background, white logo, the benefits at a glance, and a single "Start for free" call to action. Visiting it with an active session skips the pitch entirely and takes you straight to your standup. You never see marketing for a product you already use.

### Step 1 — Sign up and set up your team

You create an account (email or Google sign-in). The first time you log in, the app creates your workspace with default standup questions already filled in. You go to Settings and add your team members — their names and roles.

### Step 2 — Customise your standup

In Settings, you can change the questions your team answers during standup, set how long each person gets to speak (for example, 2 minutes), and add icebreaker questions for newcomer introductions.

### Step 3 — Run a standup

Open the Daily Standup page. Choose the speaker order — either the default list or a random shuffle. The timer starts counting down for the first speaker. When their time is up, it moves to the next person automatically.

Before you start, a row of chips lets you mark who's actually here today — tap a name to mark them absent. Absent people are skipped in the rotation and it's logged, so attendance trends show up in Insights later.

During someone's turn, you can mark them as having a **blocker** (something that is stopping their work) or **capacity** (they have free time to help others). These names collect in a sidebar so you don't forget them. Each blocker gets an optional one-line note field — enough for "waiting on design review," not a full ticket description. Each capacity offer gets a checkbox so you can mark it "claimed" once someone actually follows up and gets help.

When the standup is done, press "Copy to clipboard" — it creates a formatted summary of who has blockers and who has capacity, ready to paste into Slack, Teams, or any team chat.

All of this can be controlled with keyboard shortcuts: single key presses like D (start with default order), S (shuffle), B (mark blocker), N (next speaker). No clicking needed — the person running the meeting can keep their hands on the keyboard.

### Step 4 — Welcome a newcomer

Open the Newcomer Intro page. Each team member takes a turn answering the icebreaker questions you set up — things like "Do pineapples belong on pizza?" or "What is the worst advice you've ever received?" The flow cycles through each person one by one.

### Step 5 — Install on your phone

Since DailyMaster is a PWA (Progressive Web App — a website that behaves like a native app), you can add it to your phone's home screen. On iPhone, tap the share button in Safari and choose "Add to Home Screen." It opens full-screen without the browser address bar, just like a regular app.

### Step 6 — See trends in the Insights page

Every standup you run now gets logged — start time, end time, who spoke, who was absent, who went over their allotted time. Blockers and capacity offers persist too, instead of vanishing the moment the meeting ends. The Insights page turns this into: average standup duration over your last 10 meetings, who tends to run over time, who's been absent most, a blocker board (New / In progress / Resolved / Won't fix) you can triage days after the standup, and how much offered capacity actually gets claimed. This is also the data foundation for the MCP server, below.

### Step 7 — Connect an AI assistant

Go to Settings → MCP and generate a token — it's shown once, so copy it somewhere safe. Add `https://dailymaster.online/api/mcp` as an MCP server in Claude Desktop (or any MCP-compatible client) with that token as a Bearer credential, and it can answer questions like "what blockers are still open" or "how has our standup length trended this month" directly from your team's data — and mark a blocker resolved without you opening the app.

---

## UX details I'm proud of

**Empty state that guides you.** When you open the standup page with no team members added, the app doesn't just show a disabled button. It shows a clear message — "Add participants in Settings first" — where "Settings" is styled as a clickable link that takes you directly to the right page. Small thing, but it means a new user never gets stuck wondering "what do I do next?"

**Timer auto-advances.** When a speaker's time runs out, the app moves to the next person automatically. No one has to click "next" — the meeting keeps flowing. If someone finishes early, one key press skips ahead.

**Copy standup notes.** After the standup, one button creates a formatted summary with the date, blockers, and capacity. It sits in a visually separated card above the lists — distinct from the action buttons — and shows a "Copied!" confirmation with a brief animation so you know it worked. Paste it into your team chat. No note-taking during the meeting.

**Keyboard shortcuts for everything.** Six keys control the entire standup: D, S, B, C, N, V. The person running the meeting never has to reach for the mouse.

**Delete with undo.** Deleting a participant or question doesn't happen instantly. The row transforms into a "Deleted — Undo (5s)" bar with the name struck through and a countdown. After 5 seconds, it slides out with an animation and the deletion is final. This pattern prevents accidental data loss — no confirmation dialogs that interrupt your flow, but a safety net when you need it.

**Inline edit with autosave.** No pencil icons, no "edit mode." Every field in Settings is always editable — just click and type. Changes save automatically after 600 milliseconds of inactivity, or immediately when you click away. If you clear a field and leave, it reverts to the previous value instead of saving an empty string. This removes an entire layer of UI (edit buttons, save buttons, cancel buttons) without losing any functionality.

**100 built-in icebreaker questions.** The newcomer settings page has an "Add a random icebreaker" button with a spinning animation. It pulls from a curated pool of 100 questions — food debates, hypothetical scenarios, this-or-that picks, and quirky opinions — checked for semantic duplicates, so "What's your favorite season?" and "Summer or winter?" never both appear. The pool also filters out questions you've already added.

**Logging that doesn't block the meeting.** Standup sessions, blockers, and capacity offers all persist to the database now, but nothing about the live meeting flow waits on a network round trip. Marking a blocker updates the UI immediately from local state; the database write happens in the background, and the returned row ID gets attached to the local entry once it resolves. If you remove a blocker before the write finishes, the local ID is still there to cancel it. The facilitator never sees a spinner mid-meeting.

**A blocker board instead of a blocker list.** Blockers used to evaporate the moment a standup ended — nothing recorded whether "waiting on Anna" from Tuesday ever got resolved. The Insights page adds a four-column board (New, In progress, Resolved, Won't fix) so a blocker becomes a thing you can actually track and close, not just a name in a sidebar for 15 minutes.

**A token you see exactly once.** When you generate an MCP access token, it's displayed in full one time, with a copy button and an explicit warning — after that, only a hashed version exists in the database and the UI shows a truncated prefix for identification. This is the same pattern GitHub and Linear use for personal access tokens, and it exists because the alternative (storing or re-displaying the plaintext secret) is a real security liability, not a hypothetical one.

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
