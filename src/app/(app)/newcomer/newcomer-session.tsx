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
    <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-8 lg:px-10 lg:py-10">
      {/* Left: Questions */}
      <div className="shrink-0 lg:w-64">
        <h2 className="mb-2 text-sm font-semibold lg:mb-3">Icebreaker questions</h2>
        <div className="rounded-card bg-card p-3 lg:p-4">
          <table className="w-full">
            <tbody>
              {questions.map((q, i) => (
                <tr key={q.id}>
                  <td className="w-6 align-top text-lg font-semibold">{i + 1}.</td>
                  <td className="pb-1 text-lg font-semibold last:pb-0">{q.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Center: Main content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <h1 className="font-display text-4xl font-black tracking-tight text-primary lg:text-6xl">
          WELCOME ON BOARD!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground lg:mt-4 lg:text-base">
          Every team member will answer these questions
        </p>

        {!isStarted && (
          <div className="mt-6 lg:mt-10">
            <button
              onClick={nextSpeaker}
              disabled={members.length === 0}
              className="min-h-[44px] rounded-button bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
            >
              Start<span className="hidden lg:inline"> (N)</span>
            </button>
            {members.length === 0 && (
              <p className="mt-4 text-base text-muted-foreground lg:mt-6">
                Add participants in{" "}
                <a
                  href="/settings/participants"
                  className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Settings
                </a>{" "}
                first.
              </p>
            )}
          </div>
        )}

        {currentSpeaker && (
          <>
            <p className="mt-4 text-sm text-muted-foreground lg:mt-8 lg:text-base">
              Now speaking ({currentIndex + 1} of {members.length})
            </p>
            <h2 className="mt-1 text-3xl font-bold lg:mt-2 lg:text-4xl">{currentSpeaker.name}</h2>
            <button
              onClick={nextSpeaker}
              className="mt-4 min-h-[44px] rounded-button bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 lg:mt-6"
            >
              Next speaker<span className="hidden lg:inline"> (N)</span>
            </button>
          </>
        )}

        {isComplete && (
          <>
            <h2 className="mt-4 text-2xl font-bold lg:mt-8 lg:text-3xl">All done!</h2>
            <button
              onClick={() => setCurrentIndex(-1)}
              className="mt-4 min-h-[44px] rounded-button bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 lg:mt-6"
            >
              Start over
            </button>
          </>
        )}
      </div>

      {/* Right: spacer to balance layout on desktop */}
      <div className="hidden shrink-0 lg:block lg:w-64" />
    </div>
  );
}
