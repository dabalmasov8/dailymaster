import { getOrCreateUser } from "@/lib/auth";
import type { TeamMember, Question } from "@/types";
import { NewcomerSession } from "./newcomer-session";

export const dynamic = "force-dynamic";

export default async function NewcomerPage() {
  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];
  const questions = user.newcomerIntroQuestions as unknown as Question[];

  return (
    <NewcomerSession members={members} questions={questions} />
  );
}
