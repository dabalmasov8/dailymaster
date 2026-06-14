"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsLinks = [
  { href: "/settings/participants", label: "Participants list" },
  { href: "/settings/standup", label: "Daily Standup properties" },
  { href: "/settings/newcomer", label: "Newcomer Intro properties" },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:w-64 lg:flex-col">
      {settingsLinks.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "whitespace-nowrap rounded-pill px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted/60",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
