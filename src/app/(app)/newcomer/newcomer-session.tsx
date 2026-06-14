"use client";

import { useState, useEffect, useCallback } from "react";
import type { TeamMember, Question } from "@/types";

export function NewcomerSession({
  members,
  questions,
}: {
  members: TeamMember[];
  questions: Question[];
}) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isStarted = currentIndex >= 0;
  const isComplete = currentIndex >= members.length;
  const currentSpeaker = isStarted && !isComplete ? members[currentIndex] : null;

  const nextSpeaker = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key.toLowerCase() === "n") nextSpeaker();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSpeaker]);

  return (
    <div className="flex flex-col items-center py-16">
      <h1 className="text-6xl font-black tracking-tight text-primary">
        WELCOME ON BOARD!
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Every team member will answer these questions
      </p>

      <div className="mt-8 w-full max-w-lg rounded-card bg-card p-6">
        {questions.map((q, i) => (
          <p key={q.id} className="mb-2 text-lg font-semibold last:mb-0">
            {i + 1}. {q.text}
          </p>
        ))}
      </div>

      {!isStarted && (
        <div className="mt-10">
          <button
            onClick={nextSpeaker}
            disabled={members.length === 0}
            className="rounded-button bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
          >
            Start (N)
          </button>
          {members.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Add participants in Settings first.
            </p>
          )}
        </div>
      )}

      {currentSpeaker && (
        <div className="mt-10 flex flex-col items-center">
          <p className="text-muted-foreground">
            Now speaking ({currentIndex + 1} of {members.length})
          </p>
          <h2 className="mt-2 text-4xl font-bold">{currentSpeaker.name}</h2>
          <button
            onClick={nextSpeaker}
            className="mt-6 rounded-button bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
          >
            Next speaker (N)
          </button>
        </div>
      )}

      {isComplete && (
        <div className="mt-10 flex flex-col items-center">
          <p className="text-muted-foreground">All done!</p>
          <h2 className="mt-2 text-3xl font-bold">
            Welcome to the team, everyone!
          </h2>
          <button
            onClick={() => setCurrentIndex(-1)}
            className="mt-6 rounded-button bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
