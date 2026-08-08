import { ISSUER } from "@/lib/oauth";

// RFC 8414 — describes this server's OAuth 2.1 endpoints and capabilities.
export async function GET() {
  return Response.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/oauth/authorize`,
    token_endpoint: `${ISSUER}/oauth/token`,
    registration_endpoint: `${ISSUER}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["standups:read", "standups:write"],
  });
}
