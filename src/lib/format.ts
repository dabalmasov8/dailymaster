/** Formats a duration given in seconds as "1m 3s", "45s", or "2m". */
export function formatDuration(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}
