"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Trash2, Plus } from "lucide-react";
import { createApiToken, revokeApiToken } from "./actions";

interface TokenSummary {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  viaOAuth: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TokenManager({ initialTokens }: { initialTokens: TokenSummary[] }) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedToken, setRevealedToken] = useState<{ id: string; name: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  async function handleCreate() {
    setCreating(true);
    try {
      const { token, id } = await createApiToken(name);
      const tokenName = name.trim() || "Untitled token";
      setRevealedToken({ id, name: tokenName, token });
      setTokens((prev) => [
        {
          id,
          name: tokenName,
          tokenPrefix: token.slice(0, 14),
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          viaOAuth: false,
        },
        ...prev,
      ]);
      setName("");
    } finally {
      setCreating(false);
    }
  }

  function handleRevoke(id: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => {
      revokeApiToken(id);
    });
  }

  function handleCopy() {
    if (!revealedToken) return;
    navigator.clipboard.writeText(revealedToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {revealedToken && (
        <div className="rounded-card border border-primary bg-primary/5 p-4">
          <p className="text-sm font-semibold">
            Token created: {revealedToken.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Copy it now — you won&apos;t be able to see it again. If you lose it, revoke it and
            create a new one.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-input border border-border bg-background px-3 py-2 text-xs">
              {revealedToken.token}
            </code>
            <button
              onClick={handleCopy}
              className="flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-button border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setRevealedToken(null)}
            className="mt-3 min-h-[36px] rounded-button px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Done
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tokens.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tokens yet.</p>
        ) : (
          tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-input bg-muted px-3 py-2.5"
            >
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  {t.name}
                  {t.viaOAuth && (
                    <span className="rounded-pill bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      OAuth
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.tokenPrefix}••••••&nbsp;·&nbsp;Created {formatDate(t.createdAt)}
                  {t.lastUsedAt ? ` · Last used ${formatDate(t.lastUsedAt)}` : " · Never used"}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(t.id)}
                className="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-input text-muted-foreground hover:bg-background hover:text-destructive"
                aria-label="Revoke token"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token name (e.g. Claude Desktop)"
          className="min-h-[44px] flex-1 rounded-input border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-button bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {creating ? "Generating..." : "Generate token"}
        </button>
      </div>
    </div>
  );
}
