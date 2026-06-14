"use client";

import { useOptimistic, useActionState } from "react";
import { EditableListItem } from "@/components/ui/editable-list-item";
import { AddItemInput } from "@/components/ui/add-item-input";
import { DurationPicker } from "@/components/ui/duration-picker";
import {
  addStandupQuestion,
  updateStandupQuestion,
  deleteStandupQuestion,
  updateStandupDuration,
} from "../actions";
import type { Question, ActionResult } from "@/types";

export function StandupSettings({
  initialQuestions,
  initialMinutes,
  initialSeconds,
}: {
  initialQuestions: Question[];
  initialMinutes: number;
  initialSeconds: number;
}) {
  const [optimisticQuestions, addOptimistic] = useOptimistic(
    initialQuestions,
    (state: Question[], newQuestion: Question) => [...state, newQuestion],
  );

  const [, addAction] = useActionState(
    async (prev: ActionResult, formData: FormData) => {
      addOptimistic({
        id: crypto.randomUUID(),
        text: formData.get("text") as string,
      });
      return addStandupQuestion(prev, formData);
    },
    { success: true },
  );

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold">Questions for today</h2>
        <div className="flex flex-col gap-3">
          {optimisticQuestions.map((q) => (
            <EditableListItem
              key={q.id}
              value={q.text}
              onSave={(text) => updateStandupQuestion(q.id, text)}
              onDelete={() => deleteStandupQuestion(q.id)}
            />
          ))}
          <p className="text-sm text-muted-foreground">
            Total: {optimisticQuestions.length} questions
          </p>
          <AddItemInput
            placeholder="Question text"
            buttonLabel="Add new question"
            onAdd={(text) => {
              const formData = new FormData();
              formData.set("text", text);
              addAction(formData);
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold">
          Duration per participant
        </h2>
        <DurationPicker
          minutes={initialMinutes}
          seconds={initialSeconds}
          onMinutesChange={(m) => updateStandupDuration(m, initialSeconds)}
          onSecondsChange={(s) => updateStandupDuration(initialMinutes, s)}
        />
      </section>
    </div>
  );
}
