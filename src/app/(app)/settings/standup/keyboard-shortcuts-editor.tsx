"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { updateKeyboardShortcuts } from "../actions";
import { DEFAULT_SHORTCUTS, SHORTCUT_LABELS } from "@/types";
import type { ShortcutAction, ShortcutMap } from "@/types";
import { displayShortcutKey } from "@/lib/shortcuts";
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

// Reserved for cancelling capture — can't be assigned as a shortcut itself.
const RESERVED_KEYS = new Set(["escape"]);

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
    const key = e.key;
    if (!key || key === "Dead" || key === "Unidentified") return;
    if (RESERVED_KEYS.has(key.toLowerCase())) {
      setCapturing(null);
      return;
    }
    save({ ...shortcuts, [action]: key.toLowerCase() });
    setCapturing(null);
  }

  function handleResetOne(action: ShortcutAction) {
    save({ ...shortcuts, [action]: DEFAULT_SHORTCUTS[action] });
  }

  function handleResetAll() {
    save(DEFAULT_SHORTCUTS);
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {actionOrder.map((action) => {
          const isCustom = shortcuts[action] !== DEFAULT_SHORTCUTS[action];
          return (
            <div
              key={action}
              className="flex items-center justify-between gap-2 rounded-input bg-muted px-3 py-2"
            >
              <span className="text-sm">{SHORTCUT_LABELS[action]}</span>
              <div className="flex items-center gap-1">
                {isCustom && (
                  <button
                    onClick={() => handleResetOne(action)}
                    aria-label={`Reset ${SHORTCUT_LABELS[action]} to default`}
                    title={`Reset to default key: ${displayShortcutKey(DEFAULT_SHORTCUTS[action])}`}
                    className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-background hover:text-foreground active:scale-90"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setCapturing(action)}
                  onKeyDown={(e) => handleKeyCapture(action, e)}
                  onBlur={() => setCapturing((c) => (c === action ? null : c))}
                  className={cn(
                    "flex min-h-[36px] min-w-[64px] items-center justify-center rounded-input border px-2 text-xs font-mono font-semibold uppercase transition-colors",
                    capturing === action
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50",
                  )}
                >
                  {capturing === action ? "Press a key…" : displayShortcutKey(shortcuts[action])}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <button
        onClick={handleResetAll}
        className="mt-3 flex min-h-[36px] items-center gap-1.5 rounded-button px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset all to defaults
      </button>
    </div>
  );
}
