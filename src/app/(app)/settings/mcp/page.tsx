import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { TokenManager } from "./token-manager";

export const dynamic = "force-dynamic";

export default async function McpSettingsPage() {
  const user = await getOrCreateUser();
  const tokens = await db.apiToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      oauthClientId: true,
    },
  });

  return (
    <div className="max-w-xl">
      <StickyPageHeader>MCP access</StickyPageHeader>
      <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-2 text-sm font-semibold">Your tokens</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Connect an AI assistant to your DailyMaster data. It can read your
          standup history, blockers, and capacity offers, and change a blocker&apos;s
          status on your behalf. Tokens created through Claude.ai&apos;s own
          connector sign-in flow show up here too, labelled &quot;OAuth&quot; — revoke
          them the same way as any other token.
        </p>
        <TokenManager
          initialTokens={tokens.map((t) => ({
            id: t.id,
            name: t.name,
            tokenPrefix: t.tokenPrefix,
            createdAt: t.createdAt.toISOString(),
            lastUsedAt: t.lastUsedAt ? t.lastUsedAt.toISOString() : null,
            viaOAuth: t.oauthClientId !== null,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Claude.ai Connectors</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Add{" "}
          <code className="rounded-input bg-muted px-1.5 py-0.5 text-xs">
            https://dailymaster.online/api/mcp
          </code>{" "}
          as a custom connector in Claude.ai — it will sign you in and ask you to
          approve access, no token to copy. Use this exact URL, not just the
          domain — the sign-in step happens automatically, but the connection
          itself is at <code className="rounded-input bg-muted px-1 py-0.5 text-xs">/api/mcp</code>.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Claude Desktop / Claude Code (manual token)</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Server URL:{" "}
          <code className="rounded-input bg-muted px-1.5 py-0.5 text-xs">
            https://dailymaster.online/api/mcp
          </code>
          . Send your token as a Bearer token in the Authorization header.
        </p>
        <pre className="overflow-x-auto rounded-input bg-muted p-3 text-xs">
{`{
  "mcpServers": {
    "dailymaster": {
      "type": "http",
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
    </div>
  );
}
