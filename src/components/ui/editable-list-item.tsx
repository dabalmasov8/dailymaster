"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
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
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [editSecondary, setEditSecondary] = useState(secondaryValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function handleSave() {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    onSave(trimmed, secondaryValue !== undefined ? editSecondary.trim() : undefined);
    setEditing(false);
  }

  function handleCancel() {
    setEditValue(value);
    setEditSecondary(secondaryValue ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="flex-1 rounded-input border border-secondary bg-background px-3 py-2 text-sm focus:outline-none"
        />
        {secondaryValue !== undefined && (
          <input
            value={editSecondary}
            onChange={(e) => setEditSecondary(e.target.value)}
            placeholder={secondaryPlaceholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="w-40 rounded-input border border-secondary bg-background px-3 py-2 text-sm focus:outline-none"
          />
        )}
        <button
          onClick={handleSave}
          className="rounded-input p-1.5 text-secondary hover:bg-muted"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleCancel}
          className="rounded-input p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-1 items-center rounded-input border border-border bg-background px-3 py-2">
        <span className="flex-1 text-sm">{value}</span>
        {secondaryValue && (
          <span className="text-sm text-muted-foreground">{secondaryValue}</span>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="rounded-input p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="rounded-input p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
