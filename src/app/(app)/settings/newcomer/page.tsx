import { getOrCreateUser } from "@/lib/auth";
import type { Question } from "@/types";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { NewcomerSettings } from "./newcomer-settings";

export const dynamic = "force-dynamic";

export default async function NewcomerPropertiesPage() {
  const user = await getOrCreateUser();
  const questions = user.newcomerIntroQuestions as unknown as Question[];

  return (
    <div className="max-w-xl">
      <StickyPageHeader>Newcomer Intro properties</StickyPageHeader>
      <NewcomerSettings initialQuestions={questions} />
    </div>
  );
}
