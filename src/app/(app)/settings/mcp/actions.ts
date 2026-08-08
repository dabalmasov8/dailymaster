"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiToken } from "@/lib/mcp-auth";

export async function createApiToken(name: string): Promise<{ token: string; id: string }> {
  const user = await getOrCreateUser();
  const trimmedName = name.trim() || "Untitled token";
  const { token, tokenHash, tokenPrefix } = generateApiToken();

  const record = await db.apiToken.create({
    data: { userId: user.id, name: trimmedName, tokenHash, tokenPrefix },
  });

  revalidatePath("/settings/mcp");
  return { token, id: record.id };
}

export async function revokeApiToken(id: string): Promise<void> {
  const user = await getOrCreateUser();
  await db.apiToken.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/settings/mcp");
}
