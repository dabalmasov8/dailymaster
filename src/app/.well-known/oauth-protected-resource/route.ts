import { ISSUER, RESOURCE_URL } from "@/lib/oauth";

// RFC 9728 — tells an MCP client which authorization server protects this resource.
export async function GET() {
  return Response.json({
    resource: RESOURCE_URL,
    authorization_servers: [ISSUER],
  });
}
