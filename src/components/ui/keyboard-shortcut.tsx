import { cn } from "@/lib/utils";

interface KeyboardShortcutProps {
  shortcutKey: string;
  description: string;
  className?: string;
}

export function KeyboardShortcut({
  shortcutKey,
  description,
  className,
}: KeyboardShortcutProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <kbd className="flex h-6 min-w-6 items-center justify-center rounded-input border border-border bg-muted px-1.5 text-xs font-semibold text-foreground">
        {shortcutKey}
      </kbd>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  );
}
