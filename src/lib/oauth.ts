import { createHash } from "crypto";

export const ISSUER = "https://dailymaster.online";
export const RESOURCE_URL = "https://dailymaster.online/api/mcp";

// Access tokens minted via OAuth live this long before a client must
// re-run the authorization flow. No refresh tokens in this version —
// see README V2.2 for why.
export const OAUTH_TOKEN_LIFETIME_DAYS = 90;
export const AUTH_CODE_LIFETIME_MINUTES = 10;

export function verifyPkce(codeVerifier: string, codeChallenge: string, method: string): boolean {
  if (method !== "S256") return false;
  const computed = createHash("sha256").update(codeVerifier).digest("base64url");
  return computed === codeChallenge;
}

export function isValidRedirectUri(uri: string, registered: string[]): boolean {
  return registered.includes(uri);
}
