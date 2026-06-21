"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableListItemProps {
  value: string;
  secondaryValue?: string;
  secondaryPlaceholder?: string;
  multiline?: boolean;
  onSave: (value: string, secondaryValue?: string) => void;
  onDelete: () => void;
  className?: string;
}

export function EditableListItem({
  value,
  secondaryValue,
  secondaryPlaceholder,
  multiline,
  onSave,
  onDelete,
  className,
}: EditableListItemProps) {
  const [editValue, setEditValue] = useState(value);
  const [editSecondary, setEditSecondary] = useState(secondaryValue ?? "");
  const [pendingDelete, setPendingDelete] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [vanishing, setVanishing] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [autoResize]);

  useEffect(() => {
    return () => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

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

  function handleDelete() {
    setPendingDelete(true);
    setCountdown(5);
    let remaining = 5;
    countdownTimer.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownTimer.current) clearInterval(countdownTimer.current);
        setVanishing(true);
        setTimeout(() => onDelete(), 300);
      }
    }, 1000);
  }

  function handleUndo() {
    setPendingDelete(false);
    setVanishing(false);
    setCountdown(5);
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  }

  if (pendingDelete) {
    return (
      <div
        className={cn(
          "flex min-h-[44px] items-center justify-between rounded-input bg-destructive/10 px-3 py-2 transition-all duration-300",
          vanishing
            ? "max-h-0 -translate-x-full scale-y-0 overflow-hidden opacity-0"
            : "max-h-20 translate-x-0 scale-y-100 opacity-100",
          className,
        )}
      >
        <span className="text-sm text-muted-foreground line-through">{value}</span>
        <button
          onClick={handleUndo}
          className="flex min-h-[44px] items-center gap-1.5 px-2 text-sm font-medium text-primary hover:text-primary/80"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo ({countdown}s)
        </button>
      </div>
    );
  }

  const inputClasses =
    "min-h-[44px] flex-1 rounded-input border border-border bg-background px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex flex-1 gap-2", multiline ? "flex-col sm:flex-row" : "")}>
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            rows={1}
            onChange={(e) => {
              setEditValue(e.target.value);
              scheduleAutosave(e.target.value, editSecondary);
              autoResize();
            }}
            onBlur={() => handleBlur(editValue, editSecondary)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            className={cn(inputClasses, "resize-none overflow-hidden")}
          />
        ) : (
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
            className={inputClasses}
          />
        )}
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
            className="min-h-[44px] rounded-input border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none sm:w-40"
          />
        )}
      </div>
      <button
        onClick={handleDelete}
        className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-input text-muted-foreground hover:bg-muted hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
