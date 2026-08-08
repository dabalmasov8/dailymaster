"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { BlockerStatus } from "@/types";

export async function updateBlockerStatus(blockerId: string, status: BlockerStatus): Promise<void> {
  const user = await getOrCreateUser();
  const resolved = status === "resolved" || status === "wont_fix";
  await db.blocker.updateMany({
    where: { id: blockerId, userId: user.id },
    data: { status, resolvedAt: resolved ? new Date() : null },
  });
  revalidatePath("/blockers");
  revalidatePath("/insights");
}

export async function addBlockerComment(blockerId: string, text: string): Promise<{ id: string; createdAt: string } | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const user = await getOrCreateUser();
  const blocker = await db.blocker.findFirst({
    where: { id: blockerId, userId: user.id },
    select: { id: true },
  });
  if (!blocker) return null;

  const comment = await db.blockerComment.create({
    data: { blockerId, userId: user.id, text: trimmed },
  });
  revalidatePath("/blockers");
  return { id: comment.id, createdAt: comment.createdAt.toISOString() };
}
