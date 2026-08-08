import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDuration } from "@/lib/format";
import { computeDateRange, RANGE_LABELS, type RangePreset } from "@/lib/date-range";
import { BlockerBoard } from "./blocker-board";
import { InsightsFilters } from "./insights-filters";
import type { BlockerRecord, SessionParticipant } from "@/types";

export const dynamic = "force-dynamic";

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const VALID_PRESETS: RangePreset[] = [
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "all_time",
  "custom",
];

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const preset: RangePreset = VALID_PRESETS.includes(params.range as RangePreset)
    ? (params.range as RangePreset)
    : "this_week";
  const { start, end } = computeDateRange(preset, params.from, params.to);

  const user = await getOrCreateUser();

  const [sessions, allBlockers, capacityOffers] = await Promise.all([
    db.standupSession.findMany({
      where: { userId: user.id, endedAt: { not: null }, startedAt: { gte: start, lt: end } },
      orderBy: { startedAt: "desc" },
    }),
    // The blocker board always shows everything open, regardless of the
    // selected date range — it's a working board, not a historical report.
    db.blocker.findMany({
      where: { userId: user.id },
      orderBy: { reportedAt: "desc" },
      include: { comments: { orderBy: { createdAt: "asc" } } },
    }),
    db.capacityOffer.findMany({
      where: { userId: user.id, reportedAt: { gte: start, lt: end } },
      orderBy: { reportedAt: "desc" },
    }),
  ]);

  const blockersInRange = allBlockers.filter((b) => b.reportedAt >= start && b.reportedAt < end);

  const hasAnyData = allBlockers.length > 0 || sessions.length > 0 || capacityOffers.length > 0;

  // --- Duration trend (chronological within range, capped for display) ---
  const MAX_TREND_POINTS = 20;
  const chronological = [...sessions].reverse();
  const truncated = chronological.length > MAX_TREND_POINTS;
  const trendSessions = truncated ? chronological.slice(-MAX_TREND_POINTS) : chronological;
  const durations = trendSessions.map((s) => ({
    label: formatShortDate(s.startedAt),
    seconds: s.endedAt ? (s.endedAt.getTime() - s.startedAt.getTime()) / 1000 : 0,
  }));
  const avgDurationSeconds = sessions.length
    ? sessions.reduce(
        (sum, s) => sum + (s.endedAt ? (s.endedAt.getTime() - s.startedAt.getTime()) / 1000 : 0),
        0,
      ) / sessions.length
    : 0;
  const maxDurationSeconds = Math.max(1, ...durations.map((d) => d.seconds));

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

  // --- Blocker aging (always across all open blockers, not range-limited) ---
  const openBlockers = allBlockers.filter((b) => b.status === "new" || b.status === "in_progress");
  const oldestOpenDays = openBlockers.length
    ? Math.max(
        ...openBlockers.map((b) =>
          Math.floor((Date.now() - b.reportedAt.getTime()) / (1000 * 60 * 60 * 24)),
        ),
      )
    : 0;

  // --- Digest for the selected range ---
  const blockersResolvedInRange = allBlockers.filter(
    (b) => b.resolvedAt && b.resolvedAt >= start && b.resolvedAt < end,
  ).length;

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

  const filters = (
    <InsightsFilters activePreset={preset} from={params.from} to={params.to} />
  );

  if (!hasAnyData) {
    return (
      <div className="flex flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6">
        <div className="sticky top-14 z-40 -mx-4 border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-md sm:top-16 sm:-mx-8 sm:px-8">
          <h1 className="text-xl font-bold sm:text-2xl">Insights</h1>
        </div>
        {filters}
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Run a few standups and this page will fill in with trends —
            average duration, who runs over time, open blockers, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6">
      <div className="sticky top-14 z-40 -mx-4 border-b border-border/40 bg-background/70 px-4 py-3 backdrop-blur-md sm:top-16 sm:-mx-8 sm:px-8">
        <h1 className="text-xl font-bold sm:text-2xl">Insights</h1>
      </div>
      {filters}

      {/* Digest + summary cards, one row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card bg-card p-3 lg:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">{RANGE_LABELS[preset]}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {sessions.length} standup{sessions.length === 1 ? "" : "s"},{" "}
            {formatDuration(avgDurationSeconds)} avg · {blockersInRange.length} blocker
            {blockersInRange.length === 1 ? "" : "s"} opened, {blockersResolvedInRange} resolved ·{" "}
            {capacityOffers.length} capacity offer{capacityOffers.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-card bg-card p-3">
          <p className="text-xs font-medium text-muted-foreground">Average duration</p>
          <p className="mt-1 text-xl font-bold">{formatDuration(avgDurationSeconds)}</p>
          <p className="text-xs text-muted-foreground">
            {sessions.length} standup{sessions.length === 1 ? "" : "s"} in range
          </p>
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
          <p className="text-xs text-muted-foreground">{RANGE_LABELS[preset].toLowerCase()}</p>
        </div>
      </section>

      {/* Duration trend + rankings, side by side on wide screens */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Duration trend{truncated ? ` (last ${MAX_TREND_POINTS})` : ""}
          </h2>
          {durations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No standups in this range.</p>
          ) : (
            <div className="flex flex-col gap-1 rounded-card bg-card p-3">
              {durations.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs text-muted-foreground">{d.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-input bg-muted">
                    <div
                      className="h-full rounded-input bg-secondary"
                      style={{ width: `${Math.max(4, (d.seconds / maxDurationSeconds) * 100)}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">
                    {formatDuration(d.seconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
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
                    over time in {e.overCount} of {e.totalCount} standups
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
                    absent {e.absentCount} of {e.totalSessions} standups
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blocker board — always shows everything open, not limited by the date filter above */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Blockers (all time)
        </h2>
        <BlockerBoard blockers={serializedBlockers} />
      </section>
    </div>
  );
}
