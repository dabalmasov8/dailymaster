"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/standup", label: "Daily Standup" },
  { href: "/newcomer", label: "Newcomer Intro" },
];

const allLinks = [
  ...mainLinks,
  { href: "/settings", label: "Settings" },
];

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-header-bg">
      <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-10">
        <Link href="/standup" className="flex items-center">
          <Image
            src="/logo-dailymaster.png"
            alt="DailyMaster"
            width={180}
            height={40}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </Link>

        {/* Desktop nav — center */}
        <nav className="hidden items-center gap-1 sm:flex">
          {mainLinks.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-button px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right — Settings + avatar */}
        <div className="hidden items-center gap-2 sm:flex">
          {(() => {
            const isActive = pathname.startsWith("/settings");
            return (
              <Link
                href="/settings"
                className={cn(
                  "rounded-button px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                Settings
              </Link>
            );
          })()}
          <UserButton />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-button sm:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border/40 px-4 py-3 sm:hidden">
          {allLinks.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-button px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            );
          })}
          <div className="px-3 py-2.5">
            <UserButton />
          </div>
        </nav>
      )}
    </header>
  );
}
