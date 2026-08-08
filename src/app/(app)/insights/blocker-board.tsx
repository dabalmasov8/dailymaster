"use client";

import { useState, useTransition } from "react";
import { updateBlockerStatus } from "../standup/actions";
import type { BlockerRecord, BlockerStatus } from "@/types";

const statusLabels: Record<BlockerStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
  wont_fix: "Won't fix",
};

const statusOrder: BlockerStatus[] = ["new", "in_progress", "resolved", "wont_fix"];

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function BlockerBoard({ blockers: initialBlockers }: { blockers: BlockerRecord[] }) {
  const [blockers, setBlockers] = useState(initialBlockers);
  const [, startTransition] = useTransition();

  function handleStatusChange(id: string, status: BlockerStatus) {
    setBlockers((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    startTransition(() => {
      updateBlockerStatus(id, status);
    });
  }

  if (blockers.length === 0) {
    return <p className="text-sm text-muted-foreground">No blockers reported yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statusOrder.map((status) => {
        const items = blockers.filter((b) => b.status === status);
        return (
          <div key={status} className="rounded-card bg-card p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {statusLabels[status]} ({items.length})
            </h3>
            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">None</p>
              ) : (
                items.map((b) => (
                  <div key={b.id} className="rounded-input bg-background p-2 ring-1 ring-border">
                    <p className="text-sm font-medium">{b.memberName}</p>
                    {b.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{b.note}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {daysAgo(b.reportedAt)}
                    </p>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b.id, e.target.value as BlockerStatus)
                      }
                      className="mt-2 w-full rounded-input border border-border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
                    >
                      {statusOrder.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
