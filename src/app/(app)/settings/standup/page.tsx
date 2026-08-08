import { getOrCreateUser } from "@/lib/auth";
import type { Question, ShortcutMap } from "@/types";
import { DEFAULT_SHORTCUTS } from "@/types";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { StandupSettings } from "./standup-settings";

export const dynamic = "force-dynamic";

export default async function StandupPropertiesPage() {
  const user = await getOrCreateUser();
  const questions = user.questions as unknown as Question[];
  const shortcuts = {
    ...DEFAULT_SHORTCUTS,
    ...(user.keyboardShortcuts as unknown as Partial<ShortcutMap>),
  };

  return (
    <div className="max-w-xl">
      <StickyPageHeader>Daily Standup properties</StickyPageHeader>
      <StandupSettings
        initialQuestions={questions}
        initialMinutes={user.standupDurationMinutes}
        initialSeconds={user.standupDurationSeconds}
        initialShortcuts={shortcuts}
      />
    </div>
  );
}
