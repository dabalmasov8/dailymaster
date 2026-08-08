import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { BlockerBoard } from "./blocker-board";
import type { BlockerRecord, SessionParticipant } from "@/types";

export const dynamic = "force-dynamic";

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function InsightsPage() {
  const user = await getOrCreateUser();

  const [sessions, blockers, capacityOffers] = await Promise.all([
    db.standupSession.findMany({
      where: { userId: user.id, endedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take: 30,
    }),
    db.blocker.findMany({
      where: { userId: user.id },
      orderBy: { reportedAt: "desc" },
      include: { comments: { orderBy: { createdAt: "asc" } } },
    }),
    db.capacityOffer.findMany({ where: { userId: user.id }, orderBy: { reportedAt: "desc" } }),
  ]);

  const hasData = sessions.length > 0;

  // --- Duration trend (chronological, last 10) ---
  const recentSessions = [...sessions].reverse().slice(-10);
  const durations = recentSessions.map((s) => ({
    label: formatShortDate(s.startedAt),
    minutes: s.endedAt ? (s.endedAt.getTime() - s.startedAt.getTime()) / 60000 : 0,
  }));
  const avgDuration = durations.length
    ? durations.reduce((sum, d) => sum + d.minutes, 0) / durations.length
    : 0;
  const maxDuration = Math.max(1, ...durations.map((d) => d.minutes));

  // --- Overtime frequency per person ---
  const overtimeMap = new Map<string, { name: string; overCount: number; totalCount: number }>();
  for (const s of sessions) {
    const participants = s.participants as unknown as SessionParticipant[];
    for (const p of participants) {
      if (!p.present) continue;
      const entry = overtimeMap.get(p.memberId) ?? { name: p.name, overCount: 0, totalCount: 0 };
      entry.totalCount += 1;
      if (p.usedSeconds > p.allottedSeconds) entry.overCount += 1;
      overtimeMap.set(p.memberId, entry);
    }
  }
  const overtimeRanking = Array.from(overtimeMap.values())
    .filter((e) => e.totalCount >= 2 && e.overCount > 0)
    .sort((a, b) => b.overCount / b.totalCount - a.overCount / a.totalCount)
    .slice(0, 5);

  // --- Attendance: absence counts ---
  const attendanceMap = new Map<string, { name: string; absentCount: number; totalSessions: number }>();
  for (const s of sessions) {
    const participants = s.participants as unknown as SessionParticipant[];
    for (const p of participants) {
      const entry = attendanceMap.get(p.memberId) ?? { name: p.name, absentCount: 0, totalSessions: 0 };
      entry.totalSessions += 1;
      if (!p.present) entry.absentCount += 1;
      attendanceMap.set(p.memberId, entry);
    }
  }
  const attendanceRanking = Array.from(attendanceMap.values())
    .filter((e) => e.absentCount > 0)
    .sort((a, b) => b.absentCount - a.absentCount)
    .slice(0, 5);

  // --- Blocker aging ---
  const openBlockers = blockers.filter(
    (b) => b.status === "new" || b.status === "in_progress",
  );
  const oldestOpenDays = openBlockers.length
    ? Math.max(
        ...openBlockers.map((b) =>
          Math.floor((Date.now() - b.reportedAt.getTime()) / (1000 * 60 * 60 * 24)),
        ),
      )
    : 0;

  // --- Weekly digest ---
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekSessions = sessions.filter((s) => s.startedAt >= weekAgo);
  const weekBlockersOpened = blockers.filter((b) => b.reportedAt >= weekAgo).length;
  const weekBlockersResolved = blockers.filter(
    (b) => b.resolvedAt && b.resolvedAt >= weekAgo,
  ).length;
  const weekCapacityOffered = capacityOffers.filter((c) => c.reportedAt >= weekAgo).length;
  const weekAvgDuration = weekSessions.length
    ? weekSessions.reduce(
        (sum, s) =>
          sum + (s.endedAt ? (s.endedAt.getTime() - s.startedAt.getTime()) / 60000 : 0),
        0,
      ) / weekSessions.length
    : 0;

  const serializedBlockers: BlockerRecord[] = blockers.map((b) => ({
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

  if (!hasData) {
    return (
      <div className="flex flex-col items-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Run a few standups and this page will fill in with trends —
          average duration, who runs over time, open blockers, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6">
      <h1 className="text-xl font-bold sm:text-2xl">Insights</h1>

      {/* Digest + summary cards, one row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card bg-card p-3 lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">This week</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {weekSessions.length} standup{weekSessions.length === 1 ? "" : "s"},{" "}
            {weekAvgDuration.toFixed(1)} min avg · {weekBlockersOpened} opened,{" "}
            {weekBlockersResolved} resolved · {weekCapacityOffered} capacity offer
            {weekCapacityOffered === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-card bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Average duration</p>
          <p className="mt-1 text-xl font-bold">{avgDuration.toFixed(1)} min</p>
          <p className="text-xs text-muted-foreground">last {durations.length} standups</p>
        </div>
        <div className="rounded-card bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Open blockers</p>
          <p className="mt-1 text-xl font-bold">{openBlockers.length}</p>
          <p className="text-xs text-muted-foreground">
            {openBlockers.length > 0 ? `oldest ${oldestOpenDays}d ago` : "none open"}
          </p>
        </div>
        <div className="rounded-card bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Total standups</p>
          <p className="mt-1 text-xl font-bold">{sessions.length}</p>
          <p className="text-xs text-muted-foreground">last 30 days</p>
        </div>
      </section>

      {/* Duration trend + rankings, side by side on wide screens */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Duration trend
          </h2>
          <div className="flex flex-col gap-1 rounded-card bg-card p-3">
            {durations.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-[11px] text-muted-foreground">{d.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-input bg-muted">
                  <div
                    className="h-full rounded-input bg-secondary"
                    style={{ width: `${Math.max(4, (d.minutes / maxDuration) * 100)}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-[11px] text-muted-foreground">
                  {d.minutes.toFixed(1)}m
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Runs over time most
          </h2>
          {overtimeRanking.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough data yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {overtimeRanking.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between rounded-input bg-muted px-2.5 py-1.5 text-xs"
                >
                  <span>{e.name}</span>
                  <span className="text-muted-foreground">
                    {e.overCount}/{e.totalCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Most absences
          </h2>
          {attendanceRanking.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody's been marked absent yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {attendanceRanking.map((e) => (
                <div
                  key={e.name}
                  className="flex items-center justify-between rounded-input bg-muted px-2.5 py-1.5 text-xs"
                >
                  <span>{e.name}</span>
                  <span className="text-muted-foreground">
                    {e.absentCount}/{e.totalSessions}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blocker board */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Blockers
        </h2>
        <BlockerBoard blockers={serializedBlockers} />
      </section>
    </div>
  );
}
