import { getOrCreateUser } from "@/lib/auth";
import type { TeamMember } from "@/types";
import { ParticipantsList } from "./participants-list";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Participants list</h1>
      <ParticipantsList initialMembers={members} />
    </div>
  );
}
