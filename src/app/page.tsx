import Image from "next/image";
import Link from "next/link";
import { Smartphone, BadgeDollarSign, Check, LineChart, Kanban, Sparkles } from "lucide-react";
import { BrandBodyBackground } from "@/components/brand-body-background";

const whatsNew = [
  {
    icon: LineChart,
    title: "See the patterns, not just the meeting",
    text: "Average standup length, who tends to run long, who's been missing — tracked automatically, with quick filters for this week, last month, all time, or a custom range.",
  },
  {
    icon: Kanban,
    title: "Blockers you can actually track",
    text: "Drag a blocker from New to Resolved like a real board. Leave a comment, come back to it tomorrow — nothing gets lost in yesterday's meeting.",
  },
  {
    icon: Sparkles,
    title: "Ask an AI assistant about your team",
    text: "Connect Claude or any compatible assistant and ask “what blockers are still open” or “how has our standup length trended” — it reads straight from your data.",
  },
];

const features = [
  {
    image: "/marketing/standup.png",
    alt: "Standup in progress: countdown timer, current speaker, and one-click blocker and capacity buttons",
    title: "One timer runs the whole meeting",
    text: "The timer counts down for each speaker, and keeps counting into overtime instead of cutting them off. Nobody plays traffic cop, nobody wonders who goes next.",
    bullets: [
      "Runs into overtime instead of a forced cutoff",
      "Mark blockers, capacity, and absences with one click",
      "Keyboard shortcuts control everything, and every one is remappable",
    ],
  },
  {
    image: "/marketing/newcomer.png",
    alt: "Newcomer intro screen with an icebreaker question and the current speaker",
    title: "Newcomer intros people actually enjoy",
    text: "Replace “introduce yourself” with questions people argue about. The flow cycles through every team member, one by one.",
    bullets: [
      "100 built-in icebreaker questions",
      "Teammates actually remember the answers",
      "The new person sees who their teammates really are",
    ],
    reverse: true,
  },
  {
    image: "/marketing/copy-notes.png",
    alt: "Copy standup notes button with a formatted summary of blockers and capacity",
    title: "Notes without note-taking",
    text: "One button copies a clean, formatted summary — who has blockers, who has capacity — ready to paste straight into Slack or Teams.",
    bullets: [
      "Formatted with the date, automatically",
      "One click, instant visual confirmation",
      "Nobody has to take notes during the meeting",
    ],
  },
  {
    image: "/marketing/icebreaker.png",
    alt: "Newcomer settings with a list of icebreaker questions and an 'Add a random icebreaker' button",
    title: "Never run out of icebreakers",
    text: "Pick from a curated pool of 100 questions, checked for duplicates, so \"introduce yourself\" never gets stale.",
    bullets: [
      "100 questions, zero repeats",
      "Food debates, hypotheticals, quirky opinions",
      "Filters out questions you already added",
    ],
    reverse: true,
  },
];

const extras = [
  {
    icon: Smartphone,
    text: "Installs on your phone’s home screen. No app store needed.",
  },
  {
    icon: BadgeDollarSign,
    text: "Free. No credit card, no trial period, no per-seat pricing.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col overscroll-none bg-brand text-white">
      <BrandBodyBackground />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-10 sm:py-6">
        <Image
          src="/logo-white.png"
          alt="DailyMaster"
          width={200}
          height={50}
          className="h-8 w-auto sm:h-9"
          priority
        />
        <Link
          href="/sign-in"
          className="flex min-h-[44px] items-center rounded-button border border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          Log in
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pb-16 pt-14 text-center sm:pb-24 sm:pt-20">
        <h1 className="max-w-3xl text-3xl font-bold sm:text-5xl">
          Your FREE daily standup assistant!
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:mt-6 sm:text-lg">
          Run 15-minute standups that actually take 15 minutes. A timer picks
          the speakers, one click flags blockers, and the summary lands in your
          team chat.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 flex min-h-[48px] items-center rounded-button bg-white px-8 py-3 text-base font-semibold text-brand transition-colors hover:bg-white/90 sm:mt-10"
        >
          Start for free
        </Link>
        <p className="mt-3 text-sm text-white/70">
          No credit card. No trial period. It&apos;s just free.
        </p>
      </section>

      {/* Feature rows: benefit + screenshot */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 sm:px-10 lg:gap-24">
        {features.map(({ image, alt, title, text, bullets, reverse }) => (
          <div
            key={title}
            className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12"
          >
            <div className={reverse ? "lg:order-2" : undefined}>
              <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
              <p className="mt-3 text-base leading-relaxed text-white/85">
                {text}
              </p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-white/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className={reverse ? "lg:order-1" : undefined}>
              <Image
                src={image}
                alt={alt}
                width={1600}
                height={900}
                className="w-full rounded-card ring-1 ring-white/25 shadow-2xl"
              />
            </div>
          </div>
        ))}
      </section>

      {/* What's new */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-10">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">What&apos;s new</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {whatsNew.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-card bg-white/10 p-5 ring-1 ring-white/20">
              <Icon className="h-6 w-6" />
              <h3 className="mt-3 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Extras strip */}
      <section className="mx-auto grid w-full max-w-3xl gap-4 px-4 pb-20 sm:grid-cols-2 sm:px-10">
        {extras.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-start gap-3 rounded-card bg-white/10 p-4 ring-1 ring-white/20"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <p className="text-sm leading-relaxed text-white/90">{text}</p>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="flex flex-col items-center px-4 pb-20 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Your next standup could be your shortest one.
        </h2>
        <Link
          href="/sign-in"
          className="mt-6 flex min-h-[48px] items-center rounded-button bg-white px-8 py-3 text-base font-semibold text-brand transition-colors hover:bg-white/90"
        >
          Start for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/20 px-4 py-6 text-center text-sm text-white/70">
        DailyMaster — free forever. Built by Dmytro Abalmasov.
      </footer>
    </div>
  );
}
