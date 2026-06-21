"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { EditableListItem } from "@/components/ui/editable-list-item";
import { AddItemInput } from "@/components/ui/add-item-input";
import {
  addNewcomerQuestion,
  updateNewcomerQuestion,
  deleteNewcomerQuestion,
} from "../actions";
import type { Question } from "@/types";

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
  "Do pineapples belong on pizza?",
  "Is cereal a soup?",
  "What's your most unpopular opinion?",
  "What's your go-to late night snack?",
  "If you could live in any city, where would it be?",
  "What song do you secretly know all the words to?",
  "What's the best advice you've ever received?",
  "Beach vacation or mountain trip?",
  "What hobby would you pick up if time and money weren't an issue?",
  "What's your favorite season and why?",
  "If you could time travel, would you go to the past or the future?",
  "What's the most underrated food?",
  "What show are you binge-watching right now?",
  "What's one thing on your bucket list?",
  "If you had a theme song that played when you entered a room, what would it be?",
  "What's a fun fact about you that surprises people?",
  "Cooking at home or eating out?",
  "What's the weirdest food combo you enjoy?",
  "If you could swap jobs with anyone for a day, who would it be?",
  "What's the last thing that made you laugh out loud?",
  "Window seat or aisle seat?",
  "What's your favorite way to spend a weekend?",
  "If you could only eat one cuisine for the rest of your life, what would it be?",
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

  const [isSpinning, setIsSpinning] = useState(false);
  const [, startTransition] = useTransition();

  function handleAdd(text: string) {
    const formData = new FormData();
    formData.set("text", text);
    startTransition(() => {
      addOptimistic({
        id: Math.random().toString(36).slice(2),
        text,
      });
      addNewcomerQuestion({ success: true }, formData);
    });
  }

  function handleInspiration() {
    const available = inspirationQuestions.filter(
      (q) => !optimisticQuestions.some((existing) => existing.text === q),
    );
    if (available.length === 0) return;

    setIsSpinning(true);
    setTimeout(() => {
      const random = available[Math.floor(Math.random() * available.length)];
      handleAdd(random);
      setIsSpinning(false);
    }, 500);
  }

  return (
    <div className="flex flex-col gap-3">
      {optimisticQuestions.map((q) => (
        <EditableListItem
          key={q.id}
          value={q.text}
          multiline
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
        onAdd={handleAdd}
      />
      <button
        onClick={handleInspiration}
        disabled={isSpinning}
        className="flex min-h-[44px] w-fit items-center gap-2 rounded-button bg-ai px-4 py-2 text-sm font-medium text-ai-foreground hover:bg-ai/90 disabled:opacity-70"
      >
        <Sparkles className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
        {isSpinning ? "Picking one..." : "Add a random icebreaker"}
      </button>
    </div>
  );
}
