"use client";

import { cn } from "@/lib/utils";

interface DurationPickerProps {
  minutes: number;
  seconds: number;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
  className?: string;
}

export function DurationPicker({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  className,
}: DurationPickerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <select
          value={minutes}
          onChange={(e) => onMinutesChange(Number(e.target.value))}
          className="min-h-[44px] rounded-input border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">min</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={seconds}
          onChange={(e) => onSecondsChange(Number(e.target.value))}
          className="min-h-[44px] rounded-input border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {[0, 15, 30, 45].map((s) => (
            <option key={s} value={s}>
              {String(s).padStart(2, "0")}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">sec</span>
      </div>
    </div>
  );
}
