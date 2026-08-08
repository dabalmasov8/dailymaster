"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SessionParticipant } from "@/types";

function toJson<T>(data: T) {
  return JSON.parse(JSON.stringify(data));
}

export async function startStandupSession(
  orderMode: "default" | "shuffled",
  participants: SessionParticipant[],
): Promise<string> {
  const user = await getOrCreateUser();
  const session = await db.standupSession.create({
    data: {
      userId: user.id,
      orderMode,
      participants: toJson(participants),
    },
  });
  return session.id;
}

export async function endStandupSession(
  sessionId: string,
  participants: SessionParticipant[],
): Promise<void> {
  const user = await getOrCreateUser();
  await db.standupSession.updateMany({
    where: { id: sessionId, userId: user.id },
    data: { endedAt: new Date(), participants: toJson(participants) },
  });
  revalidatePath("/insights");
}

export async function reportBlocker(
  sessionId: string | null,
  memberId: string,
  memberName: string,
): Promise<string> {
  const user = await getOrCreateUser();
  const blocker = await db.blocker.create({
    data: { userId: user.id, sessionId, memberId, memberName },
  });
  revalidatePath("/insights");
  return blocker.id;
}

export async function updateBlockerNote(blockerId: string, note: string): Promise<void> {
  const user = await getOrCreateUser();
  await db.blocker.updateMany({
    where: { id: blockerId, userId: user.id },
    data: { note },
  });
}

export async function deleteBlocker(blockerId: string): Promise<void> {
  const user = await getOrCreateUser();
  await db.blocker.deleteMany({ where: { id: blockerId, userId: user.id } });
  revalidatePath("/insights");
}

export async function reportCapacity(
  sessionId: string | null,
  memberId: string,
  memberName: string,
): Promise<string> {
  const user = await getOrCreateUser();
  const offer = await db.capacityOffer.create({
    data: { userId: user.id, sessionId, memberId, memberName },
  });
  revalidatePath("/insights");
  return offer.id;
}

export async function deleteCapacityOffer(offerId: string): Promise<void> {
  const user = await getOrCreateUser();
  await db.capacityOffer.deleteMany({ where: { id: offerId, userId: user.id } });
  revalidatePath("/insights");
}
