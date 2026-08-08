import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { verifyApiToken } from "@/lib/mcp-auth";
import { registerTools } from "@/lib/mcp/tools";

const JSONRPC_UNAUTHORIZED = {
  jsonrpc: "2.0" as const,
  error: { code: -32001, message: "Unauthorized. Provide a valid DailyMaster API token as a Bearer token." },
  id: null,
};

const JSONRPC_METHOD_NOT_ALLOWED = {
  jsonrpc: "2.0" as const,
  error: { code: -32000, message: "Method not allowed." },
  id: null,
};

async function authenticate(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return verifyApiToken(token);
}

export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return Response.json(JSONRPC_UNAUTHORIZED, { status: 401 });
  }

  const server = new McpServer({ name: "dailymaster", version: "1.0.0" });
  registerTools(server, user.id);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function GET() {
  return Response.json(JSONRPC_METHOD_NOT_ALLOWED, { status: 405 });
}

export async function DELETE() {
  return Response.json(JSONRPC_METHOD_NOT_ALLOWED, { status: 405 });
}
