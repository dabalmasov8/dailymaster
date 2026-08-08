"use server";

import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AUTH_CODE_LIFETIME_MINUTES, isValidRedirectUri } from "@/lib/oauth";

async function loadAndValidate(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const redirectUri = String(formData.get("redirect_uri") ?? "");
  const state = formData.get("state") ? String(formData.get("state")) : null;

  const client = await db.oAuthClient.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Unknown OAuth client");

  const registeredUris = client.redirectUris as unknown as string[];
  if (!isValidRedirectUri(redirectUri, registeredUris)) {
    throw new Error("redirect_uri is not registered for this client");
  }

  return { clientId, redirectUri, state };
}

function withState(url: string, params: Record<string, string>, state: string | null) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  if (state) u.searchParams.set("state", state);
  return u.toString();
}

export async function approveAuthorization(formData: FormData): Promise<void> {
  const { clientId, redirectUri, state } = await loadAndValidate(formData);
  const codeChallenge = String(formData.get("code_challenge") ?? "");
  const codeChallengeMethod = String(formData.get("code_challenge_method") ?? "S256");
  const scope = formData.get("scope") ? String(formData.get("scope")) : null;

  const user = await getOrCreateUser();
  const expiresAt = new Date(Date.now() + AUTH_CODE_LIFETIME_MINUTES * 60 * 1000);

  const created = await db.oAuthCode.create({
    data: {
      clientId,
      userId: user.id,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      scope,
      expiresAt,
    },
  });

  redirect(withState(redirectUri, { code: created.code }, state));
}

export async function denyAuthorization(formData: FormData): Promise<void> {
  const { redirectUri, state } = await loadAndValidate(formData);
  redirect(withState(redirectUri, { error: "access_denied" }, state));
}
