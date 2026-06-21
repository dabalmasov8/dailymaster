"use client";

import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableListItemProps {
  value: string;
  secondaryValue?: string;
  secondaryPlaceholder?: string;
  onSave: (value: string, secondaryValue?: string) => void;
  onDelete: () => void;
  className?: string;
}

export function EditableListItem({
  value,
  secondaryValue,
  secondaryPlaceholder,
  onSave,
  onDelete,
  className,
}: EditableListItemProps) {
  const [editValue, setEditValue] = useState(value);
  const [editSecondary, setEditSecondary] = useState(secondaryValue ?? "");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleAutosave(newValue: string, newSecondary: string) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      const trimmed = newValue.trim();
      if (!trimmed) return;
      onSave(trimmed, secondaryValue !== undefined ? newSecondary.trim() : undefined);
    }, 600);
  }

  function handleBlur(newValue: string, newSecondary: string) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    const trimmed = newValue.trim();
    if (!trimmed) {
      setEditValue(value);
      setEditSecondary(secondaryValue ?? "");
      return;
    }
    if (trimmed !== value || (secondaryValue !== undefined && newSecondary.trim() !== (secondaryValue ?? ""))) {
      onSave(trimmed, secondaryValue !== undefined ? newSecondary.trim() : undefined);
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        value={editValue}
        onChange={(e) => {
          setEditValue(e.target.value);
          scheduleAutosave(e.target.value, editSecondary);
        }}
        onBlur={() => handleBlur(editValue, editSecondary)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="min-h-[44px] flex-1 rounded-input border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
      />
      {secondaryValue !== undefined && (
        <input
          value={editSecondary}
          onChange={(e) => {
            setEditSecondary(e.target.value);
            scheduleAutosave(editValue, e.target.value);
          }}
          onBlur={() => handleBlur(editValue, editSecondary)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          placeholder={secondaryPlaceholder}
          className="min-h-[44px] w-32 rounded-input border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none sm:w-40"
        />
      )}
      <button
        onClick={onDelete}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-input text-muted-foreground hover:bg-muted hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
