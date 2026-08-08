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

V2 gives the standup a memory — and, further into the milestone, lets you (or an AI assistant on your behalf) actually query that memory instead of staring at a sidebar that resets every morning.

**Standups now remember what happened.** Every session logs its start time, end time, speaking order, and how long each person actually took versus their allotted time. "Our standups are getting longer" went from a feeling to a fact you can check.

**Attendance is a fact, not a guess.** Before you start, a row of chips lets you mark who's actually here — tap a name to mark them absent, and they're skipped in the rotation. If someone turns out to be missing mid-meeting, there's a keyboard shortcut to mark the current speaker absent on the spot, instead of a confirmation screen standing between you and starting the meeting. Both feed the same attendance history.

**Blockers have a lifecycle, not just a mention.** A blocker used to be a name in a sidebar for fifteen minutes and then nothing. Now it persists, gets an optional note, and lives on a proper board — drag it from New to In Progress to Resolved, the same way you'd move a card in Trello. You can leave comments on a blocker as it develops ("talked to Anna, unblocked tomorrow") instead of losing that context the moment the meeting ends. Deleting a blocker gives you five seconds to undo it, like everything else destructive in this app — no "are you sure?" dialogs, just a safety net.

**Insights, sliced by the time period you actually care about.** Average standup duration, who tends to run over their allotted time, who's been absent most, all filterable by This week, Last week, This month, Last month, All time, or a custom date range — defaulting to this week, since that's usually the question you're actually asking. Durations show as "1m 3s," not "0.6 minutes."

**Your shortcuts, your way.** The six keys that run a standup — start, shuffle, mark blocker, mark capacity, next speaker, end — are now remappable in Settings, in case D-S-B-C-N-V doesn't match your muscle memory or keyboard layout.

**An AI assistant that actually knows your team.** Connect Claude (or any compatible AI assistant) to your DailyMaster account from Settings, and it can answer questions about your standups directly — no exporting data, no copy-pasting into a chat window. Things you can ask it:

- "Who's on my team?"
- "What blockers are still open, and how old is the oldest one?"
- "How has our standup length trended over the last month?"
- "Give me a digest of the last two weeks — standups, blockers, capacity."
- "Mark the design-review blocker as resolved."
- "Add a comment to that blocker saying we're waiting on design."

It reads (and, for blocker status and comments, writes) the same data the Insights page shows you — so asking an assistant is a shortcut to the app, not a separate system to keep in sync.

**A UI pass across the whole app, not just new features.** Every destructive action — deleting a participant, a question, a blocker, an access token — uses the same five-second undo pattern instead of a confirmation dialog. Hover and pressed states were audited across every button and input so the app feels responsive to touch, not just click. Typography was tightened from a sprawling set of ad-hoc sizes down to a disciplined scale. The settings sidebar and its content now scroll independently, so a long list of questions doesn't push the navigation out of view. The Insights page header stays pinned (with a soft blurred background) as you scroll a long report.

**Deliberately cut, and one thing un-cut:**

- **Capacity "claimed" tracking** shipped, then got removed. The idea was to track whether an offer of help ("I have capacity") actually turned into help given — but the checkbox that implemented it didn't have a clear mental model, and a feature nobody understands is worse than no feature. Cut cleanly rather than left half-working.
- **Newcomer answer history** (logging what each newcomer says to icebreaker questions, to build a searchable "who is this person" memory) is a genuinely good idea for a different feature surface — newcomer intros, not standups — and stays out of scope for now.
- **Cross-session blocker dependency tagging** ("waiting on Team X") only matters once there's real multi-team usage to observe. Building it now would be designing for a scenario that doesn't exist in the data yet.

The discipline is the same one from V1: define scope before writing code, and say no to good ideas that don't serve the milestone — including ones I'd already shipped.

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

Before you start, a row of chips lets you mark who's actually here today — tap a name to mark them absent. Absent people are skipped in the rotation and it's logged, so attendance trends show up in Insights later. If someone turns out to be missing once the meeting's already running, a keyboard shortcut marks the current speaker absent on the spot.

During someone's turn, you can mark them as having a **blocker** (something that is stopping their work) or **capacity** (they have free time to help others). These names collect in a sidebar so you don't forget them. Each blocker gets an optional one-line note field — enough for "waiting on design review," not a full ticket description.

When the standup is done, press "Copy standup notes" — it creates a formatted summary of who has blockers and who has capacity, ready to paste into Slack, Teams, or any team chat.

All of this can be controlled with keyboard shortcuts: single key presses for start, shuffle, mark blocker, mark capacity, next speaker, mark absent, and end. No clicking needed — the person running the meeting can keep their hands on the keyboard. Don't like the default keys? Remap any of them in Settings.

### Step 4 — Welcome a newcomer

Open the Newcomer Intro page. Each team member takes a turn answering the icebreaker questions you set up — things like "Do pineapples belong on pizza?" or "What is the worst advice you've ever received?" The flow cycles through each person one by one.

### Step 5 — Install on your phone

Since DailyMaster is a PWA (Progressive Web App — a website that behaves like a native app), you can add it to your phone's home screen. On iPhone, tap the share button in Safari and choose "Add to Home Screen." It opens full-screen without the browser address bar, just like a regular app.

### Step 6 — See trends in the Insights page

Every standup you run now gets logged — start time, end time, who spoke, who was absent, who went over their allotted time. Blockers persist too, instead of vanishing the moment the meeting ends. The Insights page turns this into average standup duration, who tends to run over time, who's been absent most, and a blocker board (New / In progress / Resolved / Won't fix) you can drag cards through and comment on, days after the standup. Filter everything by This week, Last week, This month, Last month, All time, or a custom range — it defaults to this week.

### Step 7 — Connect an AI assistant

Go to Settings → MCP and follow the instructions to connect Claude (or any compatible AI assistant) to your account. Once connected, you can ask it things like "what blockers are still open" or "how has our standup length trended this month" — it answers directly from your team's real data, and can mark a blocker resolved or add a comment to one without you opening the app.

---

## UX details I'm proud of

**Empty state that guides you.** When you open the standup page with no team members added, the app doesn't just show a disabled button. It shows a clear message — "Add participants in Settings first" — where "Settings" is styled as a clickable link that takes you directly to the right page. Small thing, but it means a new user never gets stuck wondering "what do I do next?"

**Timer auto-advances.** When a speaker's time runs out, the app moves to the next person automatically. No one has to click "next" — the meeting keeps flowing. If someone finishes early, one key press skips ahead.

**Copy standup notes.** After the standup, one button creates a formatted summary with the date, blockers, and capacity. It sits in a visually separated card above the lists — distinct from the action buttons — and shows a "Copied!" confirmation with a brief animation so you know it worked. Paste it into your team chat. No note-taking during the meeting.

**Keyboard shortcuts for everything, remappable.** Six keys control the entire standup — start, shuffle, mark blocker, mark capacity, next speaker, mark absent, end. The person running the meeting never has to reach for the mouse, and if the defaults don't fit your muscle memory, remap any of them in Settings.

**Delete with undo.** Deleting a participant or question doesn't happen instantly. The row transforms into a "Deleted — Undo (5s)" bar with the name struck through and a countdown. After 5 seconds, it slides out with an animation and the deletion is final. This pattern prevents accidental data loss — no confirmation dialogs that interrupt your flow, but a safety net when you need it.

**Inline edit with autosave.** No pencil icons, no "edit mode." Every field in Settings is always editable — just click and type. Changes save automatically after 600 milliseconds of inactivity, or immediately when you click away. If you clear a field and leave, it reverts to the previous value instead of saving an empty string. This removes an entire layer of UI (edit buttons, save buttons, cancel buttons) without losing any functionality.

**100 built-in icebreaker questions.** The newcomer settings page has an "Add a random icebreaker" button with a spinning animation. It pulls from a curated pool of 100 questions — food debates, hypothetical scenarios, this-or-that picks, and quirky opinions — checked for semantic duplicates, so "What's your favorite season?" and "Summer or winter?" never both appear. The pool also filters out questions you've already added.

**Logging that doesn't block the meeting.** Standup sessions, blockers, and capacity offers all persist to the database now, but nothing about the live meeting flow waits on a network round trip. Marking a blocker updates the UI immediately from local state; the database write happens in the background, and the returned row ID gets attached to the local entry once it resolves. If you remove a blocker before the write finishes, the local ID is still there to cancel it. The facilitator never sees a spinner mid-meeting.

**A blocker board instead of a blocker list.** Blockers used to evaporate the moment a standup ended — nothing recorded whether "waiting on Anna" from Tuesday ever got resolved. The Insights page adds a drag-and-drop board (New, In progress, Resolved, Won't fix) with comment threads, so a blocker becomes a thing you can actually track and close, not just a name in a sidebar for 15 minutes.

**Undo instead of "are you sure?" — everywhere.** Deleting a blocker, an access token, a participant, a question: all of it works the same way. A five-second window to change your mind, no modal dialog interrupting your flow.

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
