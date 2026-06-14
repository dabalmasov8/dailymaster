"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { Shuffle, Trash2, Copy } from "lucide-react";
import { TimerDisplay } from "@/components/ui/timer-display";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import type { TeamMember, Question } from "@/types";

type StandupState = {
  phase: "idle" | "active" | "complete";
  speakers: TeamMember[];
  currentIndex: number;
  timeLeft: number;
  totalTime: number;
  blockers: TeamMember[];
  capacity: TeamMember[];
};

type StandupAction =
  | { type: "START_DEFAULT"; speakers: TeamMember[]; timePerSpeaker: number }
  | { type: "START_SHUFFLED"; speakers: TeamMember[]; timePerSpeaker: number }
  | { type: "TICK" }
  | { type: "NEXT_SPEAKER" }
  | { type: "MARK_BLOCKER" }
  | { type: "MARK_CAPACITY" }
  | { type: "REMOVE_BLOCKER"; id: string }
  | { type: "REMOVE_CAPACITY"; id: string }
  | { type: "END_STANDUP" };

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function reducer(state: StandupState, action: StandupAction): StandupState {
  switch (action.type) {
    case "START_DEFAULT":
      return {
        ...state,
        phase: "active",
        speakers: action.speakers,
        currentIndex: 0,
        timeLeft: action.timePerSpeaker,
        totalTime: action.timePerSpeaker,
        blockers: [],
        capacity: [],
      };
    case "START_SHUFFLED":
      return {
        ...state,
        phase: "active",
        speakers: shuffleArray(action.speakers),
        currentIndex: 0,
        timeLeft: action.timePerSpeaker,
        totalTime: action.timePerSpeaker,
        blockers: [],
        capacity: [],
      };
    case "TICK": {
      if (state.timeLeft <= 1) {
        if (state.currentIndex >= state.speakers.length - 1) {
          return { ...state, phase: "complete", timeLeft: 0 };
        }
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
          timeLeft: state.totalTime,
        };
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    }
    case "NEXT_SPEAKER": {
      if (state.currentIndex >= state.speakers.length - 1) {
        return { ...state, phase: "complete", timeLeft: 0 };
      }
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        timeLeft: state.totalTime,
      };
    }
    case "MARK_BLOCKER": {
      const speaker = state.speakers[state.currentIndex];
      if (state.blockers.some((b) => b.id === speaker.id)) return state;
      return { ...state, blockers: [...state.blockers, speaker] };
    }
    case "MARK_CAPACITY": {
      const speaker = state.speakers[state.currentIndex];
      if (state.capacity.some((c) => c.id === speaker.id)) return state;
      return { ...state, capacity: [...state.capacity, speaker] };
    }
    case "REMOVE_BLOCKER":
      return {
        ...state,
        blockers: state.blockers.filter((b) => b.id !== action.id),
      };
    case "REMOVE_CAPACITY":
      return {
        ...state,
        capacity: state.capacity.filter((c) => c.id !== action.id),
      };
    case "END_STANDUP":
      return { ...state, phase: "complete", timeLeft: 0 };
    default:
      return state;
  }
}

const initialState: StandupState = {
  phase: "idle",
  speakers: [],
  currentIndex: 0,
  timeLeft: 0,
  totalTime: 0,
  blockers: [],
  capacity: [],
};

export function StandupSession({
  members,
  questions,
  durationMinutes,
  durationSeconds,
}: {
  members: TeamMember[];
  questions: Question[];
  durationMinutes: number;
  durationSeconds: number;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timePerSpeaker = durationMinutes * 60 + durationSeconds;

  useEffect(() => {
    if (state.phase === "active") {
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.phase, state.currentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key.toLowerCase();

      if (state.phase === "idle") {
        if (key === "d") {
          dispatch({
            type: "START_DEFAULT",
            speakers: members,
            timePerSpeaker,
          });
        } else if (key === "s") {
          dispatch({
            type: "START_SHUFFLED",
            speakers: members,
            timePerSpeaker,
          });
        }
      } else if (state.phase === "active") {
        if (key === "b") dispatch({ type: "MARK_BLOCKER" });
        else if (key === "c") dispatch({ type: "MARK_CAPACITY" });
        else if (key === "n") dispatch({ type: "NEXT_SPEAKER" });
        else if (key === "v") dispatch({ type: "END_STANDUP" });
      }
    },
    [state.phase, members, timePerSpeaker],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function copyToClipboard() {
    const lines: string[] = [];
    if (state.blockers.length > 0) {
      lines.push("People with blockers:");
      state.blockers.forEach((b) => lines.push(`- ${b.name}`));
    }
    if (state.capacity.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("People with capacity to help:");
      state.capacity.forEach((c) => lines.push(`- ${c.name}`));
    }
    if (lines.length === 0) lines.push("No blockers or capacity reported.");
    navigator.clipboard.writeText(lines.join("\n"));
  }

  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const currentSpeaker = state.speakers[state.currentIndex];

  return (
    <div className="flex flex-col gap-8 px-4 py-6 lg:flex-row lg:px-10 lg:py-10">
      {/* Left: Questions */}
      <div className="shrink-0 lg:w-64">
        <h2 className="mb-3 text-sm font-semibold">Questions for today</h2>
        <div className="flex flex-col gap-2 rounded-card bg-card p-4">
          {questions.map((q, i) => (
            <p key={q.id} className="text-lg font-semibold">
              {i + 1}. {q.text}
            </p>
          ))}
        </div>

        {/* Shortcuts legend — hidden on mobile */}
        <div className="mt-8 hidden lg:block">
          <h3 className="mb-2 text-sm font-semibold">Shortcuts</h3>
          {state.phase === "idle" ? (
            <div className="flex flex-col gap-1.5">
              <KeyboardShortcut shortcutKey="D" description="Default order" />
              <KeyboardShortcut shortcutKey="S" description="Shuffled order" />
            </div>
          ) : state.phase === "active" ? (
            <div className="flex flex-col gap-1.5">
              <KeyboardShortcut shortcutKey="B" description="Mark blocker" />
              <KeyboardShortcut
                shortcutKey="C"
                description="Mark capacity"
              />
              <KeyboardShortcut shortcutKey="N" description="Next speaker" />
              <KeyboardShortcut shortcutKey="V" description="End standup" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Center: Main content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {state.phase === "idle" && (
          <>
            <p className="text-muted-foreground">
              Daily meeting is about to start
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Select participants order
            </h1>
            <p className="mt-8 font-display text-6xl font-black tracking-wider">
              --:--
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() =>
                  dispatch({
                    type: "START_DEFAULT",
                    speakers: members,
                    timePerSpeaker,
                  })
                }
                disabled={members.length === 0}
                className="rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
              >
                Default order (D)
              </button>
              <button
                onClick={() =>
                  dispatch({
                    type: "START_SHUFFLED",
                    speakers: members,
                    timePerSpeaker,
                  })
                }
                disabled={members.length === 0}
                className="rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50"
              >
                Shuffled order (S)
              </button>
            </div>
            {members.length === 0 && (
              <p className="mt-6 text-base text-muted-foreground">
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
          </>
        )}

        {state.phase === "active" && currentSpeaker && (
          <>
            <p className="text-muted-foreground">
              Now speaking ({state.currentIndex + 1} of{" "}
              {state.speakers.length})
            </p>
            <h1 className="mt-2 text-4xl font-bold">{currentSpeaker.name}</h1>
            <div className="mt-6 flex items-center gap-3">
              <TimerDisplay
                minutes={minutes}
                seconds={seconds}
                warning={state.timeLeft <= 10}
              />
              <button
                onClick={() =>
                  dispatch({
                    type: "START_SHUFFLED",
                    speakers: state.speakers,
                    timePerSpeaker,
                  })
                }
                className="rounded-input p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Reshuffle remaining"
              >
                <Shuffle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() => dispatch({ type: "MARK_BLOCKER" })}
                className="rounded-button bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Mark blocker (B)
              </button>
              <button
                onClick={() => dispatch({ type: "MARK_CAPACITY" })}
                className="rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                Mark capacity (C)
              </button>
              <button
                onClick={() => dispatch({ type: "NEXT_SPEAKER" })}
                className="rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
              >
                Next speaker (N)
              </button>
            </div>
          </>
        )}

        {state.phase === "complete" && (
          <>
            <p className="text-muted-foreground">Standup complete!</p>
            <h1 className="mt-2 text-3xl font-bold">Great job, team!</h1>
            <TimerDisplay minutes={0} seconds={0} className="mt-8" />
            <button
              onClick={() =>
                dispatch({
                  type: "START_DEFAULT",
                  speakers: members,
                  timePerSpeaker,
                })
              }
              className="mt-8 rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
            >
              Start new standup
            </button>
          </>
        )}
      </div>

      {/* Right: Blockers & Capacity */}
      <div className="shrink-0 lg:w-64">
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold">People with blockers</h2>
          {state.blockers.length === 0 ? (
            <p className="text-sm text-muted-foreground">None</p>
          ) : (
            <div className="flex flex-col gap-2">
              {state.blockers.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-input bg-muted px-3 py-2"
                >
                  <span className="text-sm">{b.name}</span>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_BLOCKER", id: b.id })
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">
            People with capacity
          </h2>
          {state.capacity.length === 0 ? (
            <p className="text-sm text-muted-foreground">None</p>
          ) : (
            <div className="flex flex-col gap-2">
              {state.capacity.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-input bg-muted px-3 py-2"
                >
                  <span className="text-sm">{c.name}</span>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_CAPACITY", id: c.id })
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {(state.blockers.length > 0 || state.capacity.length > 0) && (
          <button
            onClick={copyToClipboard}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-button border border-secondary px-4 py-2 text-sm font-medium text-secondary hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
            Copy to clipboard
          </button>
        )}
      </div>
    </div>
  );
}
