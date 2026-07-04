import Image from "next/image";
import Link from "next/link";
import {
  LogIn,
  TimerReset,
  Keyboard,
  OctagonAlert,
  ClipboardList,
  PartyPopper,
  Smartphone,
} from "lucide-react";

const benefits = [
  {
    icon: TimerReset,
    title: "Timer that runs the meeting",
    text: "When a speaker's time is up, the app moves to the next person automatically. No awkward silence, no picking who goes next.",
  },
  {
    icon: OctagonAlert,
    title: "One-click blocker flags",
    text: "Mark who has a blocker or free capacity while they speak. No screen shares, no 40-minute detours.",
  },
  {
    icon: ClipboardList,
    title: "Notes without note-taking",
    text: "One button copies a formatted summary — date, blockers, capacity — ready to paste into Slack or Teams.",
  },
  {
    icon: Keyboard,
    title: "Keyboard-first control",
    text: "Six keys run the entire standup. The facilitator never reaches for the mouse while the team is talking.",
  },
  {
    icon: PartyPopper,
    title: "Newcomer intros people enjoy",
    text: "Replace \"introduce yourself\" with icebreakers like \"Is cereal a soup?\" — pick from 100 built-in questions.",
  },
  {
    icon: Smartphone,
    title: "Free, on any device",
    text: "Works in the browser and installs on your phone's home screen. No app store, no credit card, no per-seat pricing.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-primary text-primary-foreground">
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
          className="flex min-h-[44px] items-center gap-2 rounded-button bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/90"
        >
          <LogIn className="h-4 w-4" />
          Sign-up / Login
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-4 pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
        <h1 className="max-w-3xl text-3xl font-bold sm:text-5xl">
          Your FREE daily standup assistant!
        </h1>
        <p className="mt-4 max-w-xl text-base text-primary-foreground/85 sm:mt-6 sm:text-lg">
          Run 15-minute standups that actually take 15 minutes. A timer picks
          the speakers, one click flags blockers, and the summary lands in your
          team chat.
        </p>
        <Link
          href="/sign-in"
          className="mt-8 flex min-h-[48px] items-center gap-2 rounded-button bg-white px-8 py-3 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:mt-10"
        >
          Start for free
        </Link>
        <p className="mt-3 text-sm text-primary-foreground/70">
          No credit card. No trial period. It&apos;s just free.
        </p>
      </section>

      {/* Benefits */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-card bg-white/10 p-5 ring-1 ring-white/20"
          >
            <Icon className="h-6 w-6" />
            <h2 className="mt-3 text-base font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/85">
              {text}
            </p>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="flex flex-col items-center px-4 pb-16 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Your next standup could be your shortest one.
        </h2>
        <Link
          href="/sign-in"
          className="mt-6 flex min-h-[48px] items-center gap-2 rounded-button bg-white px-8 py-3 text-base font-semibold text-primary transition-colors hover:bg-white/90"
        >
          <LogIn className="h-5 w-5" />
          Sign-up / Login
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/20 px-4 py-6 text-center text-sm text-primary-foreground/70">
        DailyMaster — free forever. Built by Dmytro Abalmasov.
      </footer>
    </div>
  );
}
