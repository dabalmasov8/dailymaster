import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TokenManager } from "./token-manager";

export const dynamic = "force-dynamic";

export default async function McpSettingsPage() {
  const user = await getOrCreateUser();
  const tokens = await db.apiToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, tokenPrefix: true, createdAt: true, lastUsedAt: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-2 text-sm font-semibold">MCP access</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Connect an AI assistant (Claude, or any MCP client) to your DailyMaster data.
          Generate a token below and give it to your client — it can then read your
          standup history, blockers, and capacity offers, and change a blocker&apos;s
          status on your behalf.
        </p>
        <TokenManager
          initialTokens={tokens.map((t) => ({
            id: t.id,
            name: t.name,
            tokenPrefix: t.tokenPrefix,
            createdAt: t.createdAt.toISOString(),
            lastUsedAt: t.lastUsedAt ? t.lastUsedAt.toISOString() : null,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Connect a client</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Server URL:{" "}
          <code className="rounded-input bg-muted px-1.5 py-0.5 text-xs">
            https://dailymaster.online/api/mcp
          </code>
          . Send your token as a Bearer token in the Authorization header.
        </p>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Example: Claude Desktop config (claude_desktop_config.json)
        </p>
        <pre className="overflow-x-auto rounded-input bg-muted p-3 text-xs">
{`{
  "mcpServers": {
    "dailymaster": {
      "url": "https://dailymaster.online/api/mcp",
      "headers": {
        "Authorization": "Bearer dm_live_..."
      }
    }
  }
}`}
        </pre>
      </section>
    </div>
  );
}
