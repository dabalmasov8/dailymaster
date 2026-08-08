import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BlockerBoard } from "./blocker-board";
import type { BlockerRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function BlockersPage() {
  const user = await getOrCreateUser();
  const allBlockers = await db.blocker.findMany({
    where: { userId: user.id },
    orderBy: { reportedAt: "desc" },
    include: { comments: { orderBy: { createdAt: "asc" } } },
  });

  const serializedBlockers: BlockerRecord[] = allBlockers.map((b) => ({
    id: b.id,
    memberId: b.memberId,
    memberName: b.memberName,
    note: b.note,
    status: b.status as BlockerRecord["status"],
    reportedAt: b.reportedAt.toISOString(),
    resolvedAt: b.resolvedAt ? b.resolvedAt.toISOString() : null,
    resolutionNote: b.resolutionNote,
    comments: b.comments.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6">
      <div className="sticky top-14 z-40 -mx-4 border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-md sm:top-16 sm:-mx-8 sm:px-8">
        <h1 className="text-xl font-bold sm:text-2xl">Blockers</h1>
      </div>
      {serializedBlockers.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            No blockers reported yet. Mark one during a standup and it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <BlockerBoard blockers={serializedBlockers} />
      )}
    </div>
  );
}
