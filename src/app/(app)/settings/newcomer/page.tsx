import { getOrCreateUser } from "@/lib/auth";
import type { Question } from "@/types";
import { NewcomerSettings } from "./newcomer-settings";

export const dynamic = "force-dynamic";

export default async function NewcomerPropertiesPage() {
  const user = await getOrCreateUser();
  const questions = user.newcomerIntroQuestions as unknown as Question[];

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">
        Newcomer Intro properties
      </h1>
      <NewcomerSettings initialQuestions={questions} />
    </div>
  );
}
