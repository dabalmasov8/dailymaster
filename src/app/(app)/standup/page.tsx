import { getOrCreateUser } from "@/lib/auth";
import type { TeamMember, Question } from "@/types";
import { StandupSession } from "./standup-session";

export const dynamic = "force-dynamic";

export default async function StandupPage() {
  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];
  const questions = user.questions as unknown as Question[];

  return (
    <StandupSession
      members={members}
      questions={questions}
      durationMinutes={user.standupDurationMinutes}
      durationSeconds={user.standupDurationSeconds}
    />
  );
}
