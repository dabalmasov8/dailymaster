import { ISSUER, RESOURCE_URL } from "@/lib/oauth";

// RFC 9728 path-aware variant: some clients look up protected-resource
// metadata at <well-known>/<resource-path> rather than the bare
// well-known root when the resource itself isn't at "/". Same content
// as /.well-known/oauth-protected-resource, served at the path a
// strict client would check for a resource at /api/mcp.
export async function GET() {
  return Response.json({
    resource: RESOURCE_URL,
    authorization_servers: [ISSUER],
  });
}
