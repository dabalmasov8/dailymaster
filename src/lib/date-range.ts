export type RangePreset = "this_week" | "last_week" | "this_month" | "last_month" | "all_time" | "custom";

export const RANGE_LABELS: Record<RangePreset, string> = {
  this_week: "This week",
  last_week: "Last week",
  this_month: "This month",
  last_month: "Last month",
  all_time: "All time",
  custom: "Custom range",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export function computeDateRange(
  preset: RangePreset,
  customFrom?: string,
  customTo?: string,
): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case "this_week":
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case "last_week": {
      const anchor = new Date(now);
      anchor.setDate(anchor.getDate() - 7);
      return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
    }
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const anchor = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
    }
    case "all_time":
      return { start: new Date(0), end: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
    case "custom":
      return {
        start: customFrom ? startOfDay(new Date(customFrom)) : new Date(0),
        end: customTo ? new Date(new Date(customTo).getTime() + 24 * 60 * 60 * 1000) : now,
      };
  }
}
