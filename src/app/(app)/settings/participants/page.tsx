import { getOrCreateUser } from "@/lib/auth";
import type { TeamMember } from "@/types";
import { StickyPageHeader } from "@/components/layout/sticky-page-header";
import { ParticipantsList } from "./participants-list";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];

  return (
    <div className="max-w-xl">
      <StickyPageHeader>Participants list</StickyPageHeader>
      <ParticipantsList initialMembers={members} />
    </div>
  );
}
