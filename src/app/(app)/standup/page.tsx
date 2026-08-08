import { getOrCreateUser } from "@/lib/auth";
import type { TeamMember, Question, ShortcutMap } from "@/types";
import { DEFAULT_SHORTCUTS } from "@/types";
import { StandupSession } from "./standup-session";

export const dynamic = "force-dynamic";

export default async function StandupPage() {
  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];
  const questions = user.questions as unknown as Question[];
  const shortcuts = {
    ...DEFAULT_SHORTCUTS,
    ...(user.keyboardShortcuts as unknown as Partial<ShortcutMap>),
  };

  return (
    <StandupSession
      members={members}
      questions={questions}
      durationMinutes={user.standupDurationMinutes}
      durationSeconds={user.standupDurationSeconds}
      shortcuts={shortcuts}
    />
  );
}
