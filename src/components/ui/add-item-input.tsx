"use client";

import { useState, useRef, useEffect } from "react";
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
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setAdding(false);
      setValue("");
      setSecondaryValue("");
      return;
    }
    onAdd(trimmed, secondaryPlaceholder ? secondaryValue.trim() : undefined);
    setValue("");
    setSecondaryValue("");
    inputRef.current?.focus();
  }

  function handleCancel() {
    setValue("");
    setSecondaryValue("");
    setAdding(false);
  }

  if (adding) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") handleCancel();
          }}
          onBlur={() => {
            if (!value.trim() && !secondaryValue.trim()) {
              handleCancel();
            }
          }}
          placeholder={placeholder}
          className="min-h-[44px] flex-1 rounded-input border border-primary bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        {secondaryPlaceholder && (
          <input
            value={secondaryValue}
            onChange={(e) => setSecondaryValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") handleCancel();
            }}
            placeholder={secondaryPlaceholder}
            className="min-h-[44px] w-32 rounded-input border border-primary bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none sm:w-40"
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setAdding(true)}
      className={cn(
        "flex min-h-[44px] w-fit items-center gap-2 rounded-button border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary",
        className,
      )}
    >
      <Plus className="h-4 w-4" />
      {buttonLabel}
    </button>
  );
}
