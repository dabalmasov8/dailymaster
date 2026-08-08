"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { updateKeyboardShortcuts } from "../actions";
import { DEFAULT_SHORTCUTS, SHORTCUT_LABELS } from "@/types";
import type { ShortcutAction, ShortcutMap } from "@/types";
import { cn } from "@/lib/utils";

const actionOrder: ShortcutAction[] = [
  "default",
  "shuffled",
  "blocker",
  "capacity",
  "next",
  "absent",
  "end",
];

export function KeyboardShortcutsEditor({ initialShortcuts }: { initialShortcuts: ShortcutMap }) {
  const [shortcuts, setShortcuts] = useState(initialShortcuts);
  const [capturing, setCapturing] = useState<ShortcutAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function save(next: ShortcutMap) {
    const keys = Object.values(next);
    if (new Set(keys).size !== keys.length) {
      setError("Each shortcut must be a different key.");
      return;
    }
    setError(null);
    setShortcuts(next);
    startTransition(() => {
      updateKeyboardShortcuts(next);
    });
  }

  function handleKeyCapture(action: ShortcutAction, e: React.KeyboardEvent) {
    e.preventDefault();
    if (e.key === "Escape") {
      setCapturing(null);
      return;
    }
    if (e.key.length !== 1) return;
    save({ ...shortcuts, [action]: e.key.toLowerCase() });
    setCapturing(null);
  }

  function handleReset() {
    save(DEFAULT_SHORTCUTS);
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {actionOrder.map((action) => (
          <div
            key={action}
            className="flex items-center justify-between rounded-input bg-muted px-3 py-2"
          >
            <span className="text-sm">{SHORTCUT_LABELS[action]}</span>
            <button
              onClick={() => setCapturing(action)}
              onKeyDown={(e) => handleKeyCapture(action, e)}
              onBlur={() => setCapturing((c) => (c === action ? null : c))}
              className={cn(
                "flex min-h-[36px] min-w-[44px] items-center justify-center rounded-input border px-2 text-xs font-mono font-semibold uppercase transition-colors",
                capturing === action
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50",
              )}
            >
              {capturing === action ? "Press a key…" : shortcuts[action]}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <button
        onClick={handleReset}
        className="mt-3 flex min-h-[36px] items-center gap-1.5 rounded-button px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset to defaults
      </button>
    </div>
  );
}
