"use client";

import { useOptimistic, useActionState } from "react";
import { Sparkles } from "lucide-react";
import { EditableListItem } from "@/components/ui/editable-list-item";
import { AddItemInput } from "@/components/ui/add-item-input";
import {
  addNewcomerQuestion,
  updateNewcomerQuestion,
  deleteNewcomerQuestion,
} from "../actions";
import type { Question, ActionResult } from "@/types";

const inspirationQuestions = [
  "What's your hidden talent?",
  "What's the last book you read?",
  "If you could have dinner with anyone, who would it be?",
  "What's your go-to karaoke song?",
  "Coffee or tea?",
  "What did you want to be when you grew up?",
  "What's your favorite travel destination?",
  "Dogs or cats?",
  "What's your comfort food?",
  "If you could learn any skill instantly, what would it be?",
  "What's your favorite movie?",
  "Early bird or night owl?",
];

export function NewcomerSettings({
  initialQuestions,
}: {
  initialQuestions: Question[];
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
      return addNewcomerQuestion(prev, formData);
    },
    { success: true },
  );

  function handleInspiration() {
    const available = inspirationQuestions.filter(
      (q) => !optimisticQuestions.some((existing) => existing.text === q),
    );
    if (available.length === 0) return;
    const random = available[Math.floor(Math.random() * available.length)];
    const formData = new FormData();
    formData.set("text", random);
    addAction(formData);
  }

  return (
    <div className="flex flex-col gap-3">
      {optimisticQuestions.map((q) => (
        <EditableListItem
          key={q.id}
          value={q.text}
          onSave={(text) => updateNewcomerQuestion(q.id, text)}
          onDelete={() => deleteNewcomerQuestion(q.id)}
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
      <button
        onClick={handleInspiration}
        className="flex w-fit items-center gap-2 rounded-button bg-ai px-4 py-2 text-sm font-medium text-ai-foreground hover:bg-ai/90"
      >
        <Sparkles className="h-4 w-4" />
        Get inspiration
      </button>
    </div>
  );
}
