import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { db } from "@/lib/db";
import type { TeamMember, SessionParticipant, BlockerStatus } from "@/types";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function durationMinutes(startedAt: Date, endedAt: Date | null): number | null {
  if (!endedAt) return null;
  return Math.round(((endedAt.getTime() - startedAt.getTime()) / 60000) * 10) / 10;
}

const blockerStatusEnum = z.enum(["new", "in_progress", "resolved", "wont_fix"]);

export function registerTools(server: McpServer, userId: string) {
  server.registerTool(
    "list_team_members",
    {
      title: "List team members",
      description: "List the members of this user's team, as configured in DailyMaster settings.",
      inputSchema: {},
    },
    async () => {
      const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
      const members = user.teamMembers as unknown as TeamMember[];
      return json(members);
    },
  );

  server.registerTool(
    "list_standups",
    {
      title: "List recent standups",
      description:
        "List recent completed standup sessions, with start/end time, order mode, and per-participant time used vs. allotted.",
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum number of sessions to return, most recent first."),
      },
    },
    async ({ limit }) => {
      const sessions = await db.standupSession.findMany({
        where: { userId, endedAt: { not: null } },
        orderBy: { startedAt: "desc" },
        take: limit,
      });
      return json(
        sessions.map((s) => ({
          id: s.id,
          startedAt: s.startedAt.toISOString(),
          endedAt: s.endedAt?.toISOString() ?? null,
          durationMinutes: durationMinutes(s.startedAt, s.endedAt),
          orderMode: s.orderMode,
          participants: s.participants,
        })),
      );
    },
  );

  server.registerTool(
    "get_standup_stats",
    {
      title: "Get standup statistics",
      description:
        "Aggregate standup metrics over a recent period: number of standups, average duration, and how that average compares to the period before it.",
      inputSchema: {
        periodDays: z
          .number()
          .int()
          .min(1)
          .max(365)
          .default(30)
          .describe("How many days back to look."),
      },
    },
    async ({ periodDays }) => {
      const now = Date.now();
      const periodStart = new Date(now - periodDays * 24 * 60 * 60 * 1000);
      const priorStart = new Date(now - periodDays * 2 * 24 * 60 * 60 * 1000);

      const [currentSessions, priorSessions] = await Promise.all([
        db.standupSession.findMany({
          where: { userId, endedAt: { not: null }, startedAt: { gte: periodStart } },
        }),
        db.standupSession.findMany({
          where: {
            userId,
            endedAt: { not: null },
            startedAt: { gte: priorStart, lt: periodStart },
          },
        }),
      ]);

      const avg = (rows: typeof currentSessions) => {
        const durations = rows
          .map((s) => durationMinutes(s.startedAt, s.endedAt))
          .filter((d): d is number => d !== null);
        return durations.length
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : null;
      };

      const currentAvg = avg(currentSessions);
      const priorAvg = avg(priorSessions);
      const trendPct =
        currentAvg !== null && priorAvg !== null && priorAvg > 0
          ? Math.round(((currentAvg - priorAvg) / priorAvg) * 1000) / 10
          : null;

      return json({
        periodDays,
        standupCount: currentSessions.length,
        averageDurationMinutes: currentAvg !== null ? Math.round(currentAvg * 10) / 10 : null,
        previousPeriodAverageDurationMinutes:
          priorAvg !== null ? Math.round(priorAvg * 10) / 10 : null,
        trendPercent: trendPct,
        trendDescription:
          trendPct === null
            ? "Not enough data to compute a trend."
            : trendPct > 0
              ? `Standups are running ${trendPct}% longer than the previous ${periodDays}-day period.`
              : trendPct < 0
                ? `Standups are running ${Math.abs(trendPct)}% shorter than the previous ${periodDays}-day period.`
                : "Standup duration is flat compared to the previous period.",
      });
    },
  );

  server.registerTool(
    "list_blockers",
    {
      title: "List blockers",
      description:
        "List reported blockers, optionally filtered by status (new, in_progress, resolved, wont_fix).",
      inputSchema: {
        status: blockerStatusEnum
          .optional()
          .describe("Only return blockers with this status. Omit to return all."),
      },
    },
    async ({ status }) => {
      const blockers = await db.blocker.findMany({
        where: { userId, ...(status ? { status } : {}) },
        orderBy: { reportedAt: "desc" },
      });
      return json(
        blockers.map((b) => ({
          id: b.id,
          memberName: b.memberName,
          note: b.note,
          status: b.status,
          reportedAt: b.reportedAt.toISOString(),
          resolvedAt: b.resolvedAt?.toISOString() ?? null,
          resolutionNote: b.resolutionNote,
        })),
      );
    },
  );

  server.registerTool(
    "update_blocker_status",
    {
      title: "Update blocker status",
      description:
        "Change a blocker's status. Use this to mark a blocker as in progress, resolved, or won't fix.",
      inputSchema: {
        blockerId: z.string().describe("The blocker's id, from list_blockers."),
        status: blockerStatusEnum,
      },
    },
    async ({ blockerId, status }: { blockerId: string; status: BlockerStatus }) => {
      const result = await db.blocker.updateMany({
        where: { id: blockerId, userId },
        data: {
          status,
          resolvedAt: status === "resolved" || status === "wont_fix" ? new Date() : null,
        },
      });
      if (result.count === 0) {
        return json({ success: false, error: "Blocker not found." });
      }
      return json({ success: true, blockerId, status });
    },
  );

  server.registerTool(
    "list_capacity_offers",
    {
      title: "List capacity offers",
      description:
        "List people who offered capacity to help during standups, optionally filtered by whether the offer was claimed.",
      inputSchema: {
        claimed: z
          .boolean()
          .optional()
          .describe("Only return offers with this claimed state. Omit to return all."),
      },
    },
    async ({ claimed }) => {
      const offers = await db.capacityOffer.findMany({
        where: { userId, ...(claimed !== undefined ? { claimed } : {}) },
        orderBy: { reportedAt: "desc" },
      });
      return json(
        offers.map((o) => ({
          id: o.id,
          memberName: o.memberName,
          reportedAt: o.reportedAt.toISOString(),
          claimed: o.claimed,
          claimedAt: o.claimedAt?.toISOString() ?? null,
        })),
      );
    },
  );

  server.registerTool(
    "get_team_digest",
    {
      title: "Get team digest",
      description:
        "A rolled-up summary for a recent period: standup count and average duration, blockers opened/resolved, capacity offered/claimed.",
      inputSchema: {
        periodDays: z
          .number()
          .int()
          .min(1)
          .max(90)
          .default(7)
          .describe("How many days back to summarize."),
      },
    },
    async ({ periodDays }) => {
      const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

      const [sessions, blockersOpened, blockersResolved, capacityOffered, capacityClaimed] =
        await Promise.all([
          db.standupSession.findMany({
            where: { userId, endedAt: { not: null }, startedAt: { gte: since } },
          }),
          db.blocker.count({ where: { userId, reportedAt: { gte: since } } }),
          db.blocker.count({ where: { userId, resolvedAt: { gte: since } } }),
          db.capacityOffer.count({ where: { userId, reportedAt: { gte: since } } }),
          db.capacityOffer.count({
            where: { userId, claimed: true, claimedAt: { gte: since } },
          }),
        ]);

      const durations = sessions
        .map((s) => durationMinutes(s.startedAt, s.endedAt))
        .filter((d): d is number => d !== null);
      const avgDuration = durations.length
        ? Math.round((durations.reduce((sum, d) => sum + d, 0) / durations.length) * 10) / 10
        : null;

      const absences = new Map<string, number>();
      for (const s of sessions) {
        const participants = s.participants as unknown as SessionParticipant[];
        for (const p of participants) {
          if (!p.present) absences.set(p.name, (absences.get(p.name) ?? 0) + 1);
        }
      }

      return json({
        periodDays,
        standupCount: sessions.length,
        averageDurationMinutes: avgDuration,
        blockersOpened,
        blockersResolved,
        capacityOffered,
        capacityClaimed,
        absences: Object.fromEntries(absences),
      });
    },
  );
}
