import { db } from "@/lib/db";
import { generateApiToken } from "@/lib/mcp-auth";
import { verifyPkce, OAUTH_TOKEN_LIFETIME_DAYS } from "@/lib/oauth";

function errorResponse(error: string, description?: string, status = 400) {
  return Response.json({ error, error_description: description }, { status });
}

export async function POST(req: Request) {
  let params: URLSearchParams;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    params = new URLSearchParams(body);
  } else {
    const formData = await req.formData();
    params = new URLSearchParams(formData as unknown as Record<string, string>);
  }

  const grantType = params.get("grant_type");
  if (grantType !== "authorization_code") {
    return errorResponse("unsupported_grant_type");
  }

  const code = params.get("code");
  const redirectUri = params.get("redirect_uri");
  const clientId = params.get("client_id");
  const codeVerifier = params.get("code_verifier");

  if (!code || !redirectUri || !clientId || !codeVerifier) {
    return errorResponse("invalid_request", "Missing required parameters");
  }

  const authCode = await db.oAuthCode.findUnique({ where: { code } });
  // Single-use: delete on first lookup, whether or not it turns out valid.
  if (authCode) {
    await db.oAuthCode.delete({ where: { code } }).catch(() => {});
  }

  if (!authCode || authCode.expiresAt < new Date()) {
    return errorResponse("invalid_grant", "Authorization code is invalid or expired");
  }
  if (authCode.clientId !== clientId || authCode.redirectUri !== redirectUri) {
    return errorResponse("invalid_grant", "Client or redirect URI mismatch");
  }
  if (!verifyPkce(codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
    return errorResponse("invalid_grant", "PKCE verification failed");
  }

  const client = await db.oAuthClient.findUnique({ where: { id: clientId } });
  const { token, tokenHash, tokenPrefix } = generateApiToken();
  const expiresAt = new Date(Date.now() + OAUTH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  await db.apiToken.create({
    data: {
      userId: authCode.userId,
      name: `OAuth: ${client?.clientName ?? "Unknown client"}`,
      tokenHash,
      tokenPrefix,
      oauthClientId: clientId,
    },
  });

  return Response.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    scope: authCode.scope ?? undefined,
  });
}
