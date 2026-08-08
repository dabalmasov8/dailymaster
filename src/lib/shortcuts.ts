/** Renders a raw KeyboardEvent.key value (e.g. " ", "Tab", "b") for display. */
export function displayShortcutKey(key: string): string {
  if (key === " ") return "SPACE";
  return key.toUpperCase();
}
