"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { updateBlockerStatus, addBlockerComment } from "./actions";
import type { BlockerRecord, BlockerStatus } from "@/types";
import { cn } from "@/lib/utils";

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

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function BlockerBoard({ blockers: initialBlockers }: { blockers: BlockerRecord[] }) {
  const [blockers, setBlockers] = useState(initialBlockers);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<BlockerStatus | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  function moveBlocker(id: string, status: BlockerStatus) {
    setBlockers((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    startTransition(() => {
      updateBlockerStatus(id, status);
    });
  }

  function handleAddComment(blockerId: string) {
    const text = (commentDrafts[blockerId] ?? "").trim();
    if (!text) return;
    const tempId = `temp-${Date.now()}`;
    setBlockers((prev) =>
      prev.map((b) =>
        b.id === blockerId
          ? { ...b, comments: [...b.comments, { id: tempId, text, createdAt: new Date().toISOString() }] }
          : b,
      ),
    );
    setCommentDrafts((prev) => ({ ...prev, [blockerId]: "" }));
    startTransition(async () => {
      const result = await addBlockerComment(blockerId, text);
      if (result) {
        setBlockers((prev) =>
          prev.map((b) =>
            b.id === blockerId
              ? {
                  ...b,
                  comments: b.comments.map((c) =>
                    c.id === tempId ? { id: result.id, text, createdAt: result.createdAt } : c,
                  ),
                }
              : b,
          ),
        );
      }
    });
  }

  if (blockers.length === 0) {
    return <p className="text-sm text-muted-foreground">No blockers reported yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statusOrder.map((status) => {
        const items = blockers.filter((b) => b.status === status);
        const isDragTarget = dragOverStatus === status;
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) moveBlocker(id, status);
              setDragOverStatus(null);
              setDraggingId(null);
            }}
            className={cn(
              "rounded-card bg-card p-3 transition-colors",
              isDragTarget && "bg-primary/5 ring-2 ring-primary",
            )}
          >
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {statusLabels[status]} ({items.length})
            </h3>
            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="rounded-input border border-dashed border-border p-2 text-center text-xs text-muted-foreground">
                  Drop here
                </p>
              ) : (
                items.map((b) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", b.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(b.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverStatus(null);
                    }}
                    className={cn(
                      "cursor-grab rounded-input bg-background p-2 ring-1 ring-border transition-all hover:ring-primary/40 active:cursor-grabbing",
                      draggingId === b.id && "opacity-40",
                    )}
                  >
                    <p className="text-sm font-medium">{b.memberName}</p>
                    {b.note && <p className="mt-0.5 text-xs text-muted-foreground">{b.note}</p>}
                    <p className="mt-1 text-[11px] text-muted-foreground">{daysAgo(b.reportedAt)}</p>

                    {b.comments.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
                        {b.comments.map((c) => (
                          <p key={c.id} className="text-xs leading-snug">
                            {c.text}{" "}
                            <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-1">
                      <input
                        value={commentDrafts[b.id] ?? ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddComment(b.id);
                          }
                        }}
                        placeholder="Add a comment..."
                        className="min-h-[32px] flex-1 rounded-input border border-border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground transition-colors hover:border-foreground/30 focus:border-primary focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(b.id)}
                        aria-label="Add comment"
                        className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
