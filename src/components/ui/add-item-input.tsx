"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddItemInputProps {
  placeholder: string;
  secondaryPlaceholder?: string;
  buttonLabel: string;
  onAdd: (value: string, secondaryValue?: string) => void;
  className?: string;
}

export function AddItemInput({
  placeholder,
  secondaryPlaceholder,
  buttonLabel,
  onAdd,
  className,
}: AddItemInputProps) {
  const [value, setValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed, secondaryPlaceholder ? secondaryValue.trim() : undefined);
    setValue("");
    setSecondaryValue("");
    inputRef.current?.focus();
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder={placeholder}
          className="flex-1 rounded-input border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
        />
        {secondaryPlaceholder && (
          <input
            value={secondaryValue}
            onChange={(e) => setSecondaryValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder={secondaryPlaceholder}
            className="w-40 rounded-input border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-secondary focus:outline-none"
          />
        )}
      </div>
      <button
        onClick={handleSubmit}
        className="flex w-fit items-center gap-2 rounded-button bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
      >
        <Plus className="h-4 w-4" />
        {buttonLabel}
      </button>
    </div>
  );
}
