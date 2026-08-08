"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MessageSquare, UserPlus, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsLinks = [
  { href: "/settings/participants", label: "Participants", icon: Users },
  { href: "/settings/standup", label: "Standup", icon: MessageSquare },
  { href: "/settings/newcomer", label: "Newcomer", icon: UserPlus },
  { href: "/settings/mcp", label: "MCP", icon: Plug },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: segmented control — horizontally scrollable with an edge fade hint */}
      <div className="relative lg:hidden">
        <nav
          className="flex gap-1 overflow-x-auto rounded-card bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {settingsLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-button px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-card bg-gradient-to-l from-muted to-transparent"
        />
      </div>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden w-64 flex-col gap-1 lg:flex">
        {settingsLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const fullLabels: Record<string, string> = {
            "/settings/participants": "Participants list",
            "/settings/standup": "Daily Standup properties",
            "/settings/newcomer": "Newcomer Intro properties",
            "/settings/mcp": "MCP access",
          };
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-button px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-foreground hover:bg-muted/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {fullLabels[href] ?? label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
