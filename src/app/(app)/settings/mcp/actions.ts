"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiToken } from "@/lib/mcp-auth";

function defaultTokenName(): string {
  const now = new Date();
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `Token from ${date}, ${time}`;
}

export async function createApiToken(name: string): Promise<{ token: string; id: string }> {
  const user = await getOrCreateUser();
  const trimmedName = name.trim() || defaultTokenName();
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
