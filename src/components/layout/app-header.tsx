"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { NavLink } from "./nav-link";

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-header-bg px-4 sm:h-[90px] sm:px-10">
      <Link href="/standup" className="flex items-center">
        <Image
          src="/logo-dailymaster.png"
          alt="DailyMaster"
          width={180}
          height={40}
          className="h-8 w-auto sm:h-10"
          priority
        />
      </Link>
      <nav className="flex items-center gap-4 sm:gap-8">
        <NavLink href="/standup">Daily Standup</NavLink>
        <NavLink href="/newcomer">Newcomer Intro</NavLink>
      </nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <NavLink href="/settings" className="hidden sm:inline">
          Settings
        </NavLink>
        <UserButton />
      </div>
    </header>
  );
}
