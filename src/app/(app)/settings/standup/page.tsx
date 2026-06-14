import { getOrCreateUser } from "@/lib/auth";
import type { Question } from "@/types";
import { StandupSettings } from "./standup-settings";

export const dynamic = "force-dynamic";

export default async function StandupPropertiesPage() {
  const user = await getOrCreateUser();
  const questions = user.questions as unknown as Question[];

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Daily Standup properties</h1>
      <StandupSettings
        initialQuestions={questions}
        initialMinutes={user.standupDurationMinutes}
        initialSeconds={user.standupDurationSeconds}
      />
    </div>
  );
}
