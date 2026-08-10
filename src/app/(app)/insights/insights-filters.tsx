"use client";

import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RangePreset } from "@/lib/date-range";

const presets: { value: RangePreset; label: string }[] = [
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "all_time", label: "All time" },
];

export function InsightsFilters({
  activePreset,
  from,
  to,
}: {
  activePreset: RangePreset;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function setPreset(preset: RangePreset) {
    router.push(`${pathname}?range=${preset}`);
  }

  function setCustomRange(newFrom: string, newTo: string) {
    if (!newFrom && !newTo) return;
    router.push(`${pathname}?range=custom&from=${newFrom}&to=${newTo}`);
  }

  function clearCustomRange() {
    router.push(pathname);
  }

  const dateInputClasses = (active: boolean) =>
    cn(
      "min-h-[36px] rounded-input border px-2 py-1 text-xs transition-colors hover:border-foreground/40 focus:border-primary focus:outline-none",
      active ? "border-primary text-primary" : "border-border text-muted-foreground",
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.value}
          onClick={() => setPreset(p.value)}
          className={cn(
            "min-h-[36px] rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95",
            activePreset === p.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
      <div className="h-6 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        <input
          key={`from-${from ?? ""}`}
          type="date"
          defaultValue={from}
          onChange={(e) => setCustomRange(e.target.value, to ?? "")}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className={dateInputClasses(activePreset === "custom")}
          aria-label="Custom range start date"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          key={`to-${to ?? ""}`}
          type="date"
          defaultValue={to}
          onChange={(e) => setCustomRange(from ?? "", e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className={dateInputClasses(activePreset === "custom")}
          aria-label="Custom range end date"
        />
        {activePreset === "custom" && (from || to) && (
          <button
            onClick={clearCustomRange}
            aria-label="Clear custom date range"
            title="Clear custom range"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
