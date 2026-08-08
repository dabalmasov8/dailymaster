import { db } from "@/lib/db";

// RFC 7591 — Dynamic Client Registration. Any MCP client (Claude.ai, etc.)
// calls this once, the first time a user tries to connect, to obtain a
// client_id. No client_secret is issued — clients are public and must use
// PKCE (enforced at the token endpoint).
export async function POST(req: Request) {
  let body: { redirect_uris?: unknown; client_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const redirectUris = body.redirect_uris;
  if (!Array.isArray(redirectUris) || redirectUris.length === 0 || !redirectUris.every((u) => typeof u === "string")) {
    return Response.json(
      { error: "invalid_client_metadata", error_description: "redirect_uris is required" },
      { status: 400 },
    );
  }
  for (const uri of redirectUris) {
    try {
      new URL(uri);
    } catch {
      return Response.json(
        { error: "invalid_redirect_uri", error_description: `Not a valid URL: ${uri}` },
        { status: 400 },
      );
    }
  }

  const clientName = typeof body.client_name === "string" ? body.client_name : null;

  const client = await db.oAuthClient.create({
    data: { clientName, redirectUris: redirectUris },
  });

  return Response.json(
    {
      client_id: client.id,
      client_name: clientName,
      redirect_uris: redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
    },
    { status: 201 },
  );
}
