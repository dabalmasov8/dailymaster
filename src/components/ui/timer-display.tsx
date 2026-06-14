import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  warning?: boolean;
  className?: string;
}

export function TimerDisplay({
  minutes,
  seconds,
  warning,
  className,
}: TimerDisplayProps) {
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <p
      className={cn(
        "font-mono text-6xl font-black tracking-wider",
        warning && "text-destructive",
        className,
      )}
    >
      {display}
    </p>
  );
}
