import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

const TOKEN_PREFIX = "dm_live_";

export function generateApiToken(): { token: string; tokenHash: string; tokenPrefix: string } {
  const secret = randomBytes(24).toString("base64url");
  const token = `${TOKEN_PREFIX}${secret}`;
  const tokenHash = hashToken(token);
  const tokenPrefix = token.slice(0, TOKEN_PREFIX.length + 6);
  return { token, tokenHash, tokenPrefix };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function verifyApiToken(token: string) {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const tokenHash = hashToken(token);
  const record = await db.apiToken.findUnique({ where: { tokenHash } });
  if (!record) return null;

  db.apiToken
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return db.user.findUnique({ where: { id: record.userId } });
}
