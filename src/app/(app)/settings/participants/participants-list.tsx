"use client";

import { useOptimistic, useTransition } from "react";
import { EditableListItem } from "@/components/ui/editable-list-item";
import { AddItemInput } from "@/components/ui/add-item-input";
import {
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../actions";
import type { TeamMember } from "@/types";

export function ParticipantsList({
  initialMembers,
}: {
  initialMembers: TeamMember[];
}) {
  const [optimisticMembers, addOptimistic] = useOptimistic(
    initialMembers,
    (state: TeamMember[], newMember: TeamMember) => [...state, newMember],
  );

  const [, startTransition] = useTransition();

  function handleAdd(name: string) {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("position", "");
    startTransition(() => {
      addOptimistic({
        id: Math.random().toString(36).slice(2),
        name,
        position: "",
      });
      addTeamMember({ success: true }, formData);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {optimisticMembers.map((member) => (
        <EditableListItem
          key={member.id}
          value={member.name}
          onSave={(name) =>
            updateTeamMember(member.id, name, member.position)
          }
          onDelete={() => deleteTeamMember(member.id)}
        />
      ))}
      <p className="text-sm text-muted-foreground">
        Total: {optimisticMembers.length} participants
      </p>
      <AddItemInput
        placeholder="Name"
        buttonLabel="Add new participant"
        onAdd={handleAdd}
      />
    </div>
  );
}
