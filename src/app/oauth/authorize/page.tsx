import { db } from "@/lib/db";
import { isValidRedirectUri } from "@/lib/oauth";
import { approveAuthorization, denyAuthorization } from "./actions";

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-destructive">Can&apos;t connect this app</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const {
    response_type: responseType,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod = "S256",
    state,
    scope,
  } = params;

  if (responseType !== "code" || !clientId || !redirectUri || !codeChallenge) {
    return <ErrorScreen message="This authorization request is missing required parameters." />;
  }
  if (codeChallengeMethod !== "S256") {
    return <ErrorScreen message="This app doesn't support the requested PKCE method." />;
  }

  const client = await db.oAuthClient.findUnique({ where: { id: clientId } });
  if (!client) {
    return <ErrorScreen message="This app isn't registered with DailyMaster." />;
  }
  const registeredUris = client.redirectUris as unknown as string[];
  if (!isValidRedirectUri(redirectUri, registeredUris)) {
    return <ErrorScreen message="This app's redirect address doesn't match what it registered." />;
  }

  const hiddenFields = {
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    ...(state ? { state } : {}),
    ...(scope ? { scope } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card bg-card p-6 text-center">
        <h1 className="text-lg font-bold">
          {client.clientName ?? "An app"} wants to access your DailyMaster data
        </h1>
        <p className="mt-3 text-left text-sm text-muted-foreground">This will let it:</p>
        <ul className="mt-1 flex flex-col gap-1 text-left text-sm text-muted-foreground">
          <li>• Read your standup history, blockers, and capacity offers</li>
          <li>• Mark blockers as resolved on your behalf</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          You can revoke this at any time from Settings → MCP.
        </p>

        <div className="mt-6 flex gap-3">
          <form action={denyAuthorization} className="flex-1">
            {Object.entries(hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-button border border-border text-sm font-medium text-foreground hover:bg-muted"
            >
              Deny
            </button>
          </form>
          <form action={approveAuthorization} className="flex-1">
            {Object.entries(hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-button bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Allow
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
