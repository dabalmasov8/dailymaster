import { cn } from "@/lib/utils";

/**
 * A page title that stays pinned while its content scrolls, with a
 * translucent blurred background. Below the app header on mobile
 * (normal document scroll); flush to the top of its own scroll pane on
 * desktop, where settings content scrolls independently of the sidebar.
 */
export function StickyPageHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-14 z-30 mb-6 border-b border-border/40 bg-background/70 py-3 backdrop-blur-md sm:top-16 lg:top-0",
        className,
      )}
    >
      <h1 className="text-xl font-semibold">{children}</h1>
    </div>
  );
}
