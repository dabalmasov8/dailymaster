"use client";

import { useOptimistic, useActionState } from "react";
import { EditableListItem } from "@/components/ui/editable-list-item";
import { AddItemInput } from "@/components/ui/add-item-input";
import {
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../actions";
import type { TeamMember, ActionResult } from "@/types";

export function ParticipantsList({
  initialMembers,
}: {
  initialMembers: TeamMember[];
}) {
  const [optimisticMembers, addOptimistic] = useOptimistic(
    initialMembers,
    (state: TeamMember[], newMember: TeamMember) => [...state, newMember],
  );

  const [, addAction] = useActionState(
    async (prev: ActionResult, formData: FormData) => {
      addOptimistic({
        id: crypto.randomUUID(),
        name: formData.get("name") as string,
        position: (formData.get("position") as string) ?? "",
      });
      return addTeamMember(prev, formData);
    },
    { success: true },
  );

  return (
    <div className="flex flex-col gap-3">
      {optimisticMembers.map((member) => (
        <EditableListItem
          key={member.id}
          value={member.name}
          secondaryValue={member.position}
          secondaryPlaceholder="Position"
          onSave={(name, position) =>
            updateTeamMember(member.id, name, position ?? "")
          }
          onDelete={() => deleteTeamMember(member.id)}
        />
      ))}
      <p className="text-sm text-muted-foreground">
        Total: {optimisticMembers.length} participants
      </p>
      <AddItemInput
        placeholder="Name"
        secondaryPlaceholder="Position"
        buttonLabel="Add new participant"
        onAdd={(name, position) => {
          const formData = new FormData();
          formData.set("name", name);
          formData.set("position", position ?? "");
          addAction(formData);
        }}
      />
    </div>
  );
}
