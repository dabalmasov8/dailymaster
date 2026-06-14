import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getOrCreateUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (existing) {
    return existing;
  }

  return db.user.create({
    data: { clerkId: userId },
  });
}
