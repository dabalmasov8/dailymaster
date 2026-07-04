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
  // Food & drink debates
  "Do pineapples belong on pizza?",
  "Is cereal a soup?",
  "Is a hot dog a sandwich?",
  "Should ketchup be kept in the fridge?",
  "What's your comfort food?",
  "What's the most underrated vegetable?",
  "What's the weirdest food combo you actually enjoy?",
  "If you could only eat one cuisine for the rest of your life, what would it be?",
  "Coffee or tea?",
  "Sweet or savoury breakfast?",
  "What food do you refuse to try?",
  "What's your go-to midnight snack?",
  "What's the best pizza topping combination?",
  "Cooking at home or eating out?",
  "What dish would you cook to impress someone?",
  // This or that
  "Dogs or cats?",
  "Early bird or night owl?",
  "Beach vacation or mountain trip?",
  "Window seat or aisle seat?",
  "Books or movies?",
  "Texting or calling?",
  "Summer or winter?",
  "City life or countryside?",
  "Board games or video games?",
  "Plan every detail or go with the flow?",
  // Hypotheticals
  "If you could have dinner with anyone, living or dead, who would it be?",
  "If you could time travel, would you go to the past or the future?",
  "If you could instantly master one skill, what would it be?",
  "If you had a theme song that played when you entered a room, what would it be?",
  "If you could swap jobs with anyone for a day, whose job would you take?",
  "If animals could talk, which would be the rudest?",
  "If you won the lottery tomorrow, what's the first thing you'd buy?",
  "If you could live in any fictional universe, which one?",
  "If you had to teach a class on one thing, what would you teach?",
  "If you could make one thing free for everyone forever, what would it be?",
  "Would you rather explore deep space or the deep ocean?",
  "Would you rather always be 10 minutes late or 20 minutes early?",
  "If you could rename yourself, what name would you pick?",
  "If your pet could review you, what would the review say?",
  "If you could ban one word from meetings forever, which one?",
  // Personal
  "What's your hidden talent?",
  "What did you want to be when you grew up?",
  "What's the best advice you've ever received?",
  "What's a fun fact about you that surprises people?",
  "What's one thing on your bucket list?",
  "What's your most unpopular opinion?",
  "What's your go-to karaoke song?",
  "What hobby would you pick up if time and money weren't an issue?",
  "What's the last thing that made you laugh out loud?",
  "What's your favorite way to spend a weekend?",
  "What was your first job?",
  "What's the most spontaneous thing you've ever done?",
  "What's a small thing that instantly improves your day?",
  "What's your proudest DIY or craft moment?",
  "What childhood toy do you wish you still had?",
  "What's the best gift you've ever received?",
  "What's your weirdest habit?",
  "What's something new you learned this year?",
  "What's your favorite family tradition?",
  "What smell instantly brings back memories?",
  // Pop culture & media
  "What's the last book you read?",
  "What show are you binge-watching right now?",
  "What's your favorite movie?",
  "What movie can you quote from memory?",
  "What's the best concert you've ever been to?",
  "What fictional character do you relate to the most?",
  "What's the first video game you ever played?",
  "If your life were a movie, what genre would it be?",
  "Which celebrity would play you in a biopic?",
  "What TV show ended too soon?",
  // Travel & places
  "What's your favorite travel destination?",
  "If you could live in any city, where would it be?",
  "What's the best meal you've had while traveling?",
  "What's the strangest place you've ever slept?",
  "Road trip or flight?",
  "What's one local spot everyone should visit in your hometown?",
  "Could you live without the internet for a month?",
  "What language would you love to speak fluently?",
  // Work-light
  "Standing desk or comfy chair?",
  "What's the best team event you've ever attended?",
  "Camera on or camera off in meetings?",
  "What's your favorite keyboard shortcut?",
  "Tabs or spaces?",
  "What emoji do you use the most?",
  "Music while working or silence?",
  // Quirky debates & opinions
  "Is water wet?",
  "Does the toilet paper go over or under?",
  "Is it acceptable to recline your seat on a plane?",
  "Shower in the morning or at night?",
  "Is a straw one hole or two?",
  "What's the most overrated invention?",
  "What everyday task should be an Olympic sport?",
  "What's the best sound in the world?",
  "What superpower would be the most annoying to have?",
  "What's the silliest fear you have?",
  "Aliens: yes or no?",
  "What would you name a boat if you had one?",
  "What's the most useless fact you know?",
  "If you were a kitchen appliance, which one would you be?",
  "What conspiracy theory would you start as a joke?",
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
