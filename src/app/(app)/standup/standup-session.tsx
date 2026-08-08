"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
import { Shuffle, ListOrdered, Trash2, ClipboardCheck, FileText, MessageSquarePlus, UserX } from "lucide-react";
import { TimerDisplay } from "@/components/ui/timer-display";
import { cn } from "@/lib/utils";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import {
  startStandupSession,
  endStandupSession,
  reportBlocker,
  updateBlockerNote,
  deleteBlocker,
  reportCapacity,
  deleteCapacityOffer,
} from "./actions";
import type { TeamMember, Question, ShortcutMap } from "@/types";

type LoggedSpeaker = {
  memberId: string;
  name: string;
  present: boolean;
  allottedSeconds: number;
  usedSeconds: number;
};

type BlockerEntry = {
  id: string;
  dbId: string | null;
  memberId: string;
  name: string;
  note: string;
};

type CapacityEntry = {
  id: string;
  dbId: string | null;
  memberId: string;
  name: string;
};

type StandupState = {
  phase: "idle" | "active" | "complete";
  speakers: TeamMember[];
  currentIndex: number;
  timeLeft: number;
  totalTime: number;
  blockers: BlockerEntry[];
  capacity: CapacityEntry[];
  isShuffled: boolean;
  speakerLog: LoggedSpeaker[];
  absentIds: string[];
};

type StandupAction =
  | { type: "TOGGLE_ABSENT"; id: string }
  | { type: "START_DEFAULT"; speakers: TeamMember[]; timePerSpeaker: number }
  | { type: "START_SHUFFLED"; speakers: TeamMember[]; timePerSpeaker: number }
  | { type: "TICK" }
  | { type: "NEXT_SPEAKER" }
  | { type: "MARK_ABSENT_CURRENT" }
  | { type: "MARK_BLOCKER"; localId: string }
  | { type: "MARK_CAPACITY"; localId: string }
  | { type: "SET_BLOCKER_DB_ID"; localId: string; dbId: string }
  | { type: "SET_CAPACITY_DB_ID"; localId: string; dbId: string }
  | { type: "UPDATE_BLOCKER_NOTE"; id: string; note: string }
  | { type: "REMOVE_BLOCKER"; id: string }
  | { type: "REMOVE_CAPACITY"; id: string }
  | { type: "END_STANDUP" }
  | { type: "RETURN_TO_IDLE" };

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function logCurrentSpeaker(state: StandupState): LoggedSpeaker[] {
  const speaker = state.speakers[state.currentIndex];
  if (!speaker) return state.speakerLog;
  return [
    ...state.speakerLog,
    {
      memberId: speaker.id,
      name: speaker.name,
      present: true,
      allottedSeconds: state.totalTime,
      usedSeconds: state.totalTime - state.timeLeft,
    },
  ];
}

function advanceOrComplete(state: StandupState, speakerLog: LoggedSpeaker[]): StandupState {
  if (state.currentIndex >= state.speakers.length - 1) {
    return { ...state, phase: "complete", timeLeft: 0, speakerLog };
  }
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    timeLeft: state.totalTime,
    speakerLog,
  };
}

function reducer(state: StandupState, action: StandupAction): StandupState {
  switch (action.type) {
    case "TOGGLE_ABSENT":
      return {
        ...state,
        absentIds: state.absentIds.includes(action.id)
          ? state.absentIds.filter((id) => id !== action.id)
          : [...state.absentIds, action.id],
      };
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
        isShuffled: false,
        speakerLog: [],
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
        isShuffled: true,
        speakerLog: [],
      };
    case "TICK": {
      if (state.timeLeft <= 1) {
        return advanceOrComplete(state, logCurrentSpeaker(state));
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    }
    case "NEXT_SPEAKER":
      return advanceOrComplete(state, logCurrentSpeaker(state));
    case "MARK_ABSENT_CURRENT": {
      const speaker = state.speakers[state.currentIndex];
      if (!speaker) return state;
      const speakerLog = [
        ...state.speakerLog,
        { memberId: speaker.id, name: speaker.name, present: false, allottedSeconds: 0, usedSeconds: 0 },
      ];
      return advanceOrComplete(state, speakerLog);
    }
    case "MARK_BLOCKER": {
      const speaker = state.speakers[state.currentIndex];
      if (state.blockers.some((b) => b.memberId === speaker.id)) return state;
      return {
        ...state,
        blockers: [
          ...state.blockers,
          { id: action.localId, dbId: null, memberId: speaker.id, name: speaker.name, note: "" },
        ],
      };
    }
    case "MARK_CAPACITY": {
      const speaker = state.speakers[state.currentIndex];
      if (state.capacity.some((c) => c.memberId === speaker.id)) return state;
      return {
        ...state,
        capacity: [
          ...state.capacity,
          { id: action.localId, dbId: null, memberId: speaker.id, name: speaker.name },
        ],
      };
    }
    case "SET_BLOCKER_DB_ID":
      return {
        ...state,
        blockers: state.blockers.map((b) =>
          b.id === action.localId ? { ...b, dbId: action.dbId } : b,
        ),
      };
    case "SET_CAPACITY_DB_ID":
      return {
        ...state,
        capacity: state.capacity.map((c) =>
          c.id === action.localId ? { ...c, dbId: action.dbId } : c,
        ),
      };
    case "UPDATE_BLOCKER_NOTE":
      return {
        ...state,
        blockers: state.blockers.map((b) =>
          b.id === action.id ? { ...b, note: action.note } : b,
        ),
      };
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
    case "END_STANDUP": {
      const speakerLog = logCurrentSpeaker(state);
      return { ...state, phase: "complete", timeLeft: 0, speakerLog };
    }
    case "RETURN_TO_IDLE":
      return { ...state, phase: "idle" };
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
  isShuffled: false,
  speakerLog: [],
  absentIds: [],
};

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function StandupSession({
  members,
  questions,
  durationMinutes,
  durationSeconds,
  shortcuts,
}: {
  members: TeamMember[];
  questions: Question[];
  durationMinutes: number;
  durationSeconds: number;
  shortcuts: ShortcutMap;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionEndedRef = useRef(false);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const timePerSpeaker = durationMinutes * 60 + durationSeconds;
  const presentMembers = members.filter((m) => !state.absentIds.includes(m.id));

  useEffect(() => {
    if (state.phase === "active") {
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.phase, state.currentIndex]);

  async function startSession(orderMode: "default" | "shuffled", speakers: TeamMember[]) {
    sessionEndedRef.current = false;
    dispatch(
      orderMode === "default"
        ? { type: "START_DEFAULT", speakers, timePerSpeaker }
        : { type: "START_SHUFFLED", speakers, timePerSpeaker },
    );
    const absentees = members.filter((m) => state.absentIds.includes(m.id));
    const id = await startStandupSession(orderMode, [
      ...speakers.map((s) => ({
        memberId: s.id,
        name: s.name,
        present: true,
        allottedSeconds: timePerSpeaker,
        usedSeconds: 0,
      })),
      ...absentees.map((a) => ({
        memberId: a.id,
        name: a.name,
        present: false,
        allottedSeconds: 0,
        usedSeconds: 0,
      })),
    ]);
    sessionIdRef.current = id;
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key.toLowerCase();

      if (state.phase === "idle") {
        if (key === shortcuts.default) startSession("default", presentMembers);
        else if (key === shortcuts.shuffled) startSession("shuffled", presentMembers);
      } else if (state.phase === "active") {
        if (key === shortcuts.blocker) handleMarkBlocker();
        else if (key === shortcuts.capacity) handleMarkCapacity();
        else if (key === shortcuts.next) dispatch({ type: "NEXT_SPEAKER" });
        else if (key === shortcuts.absent) dispatch({ type: "MARK_ABSENT_CURRENT" });
        else if (key === shortcuts.end) dispatch({ type: "END_STANDUP" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.phase, presentMembers, timePerSpeaker, shortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Persist the session once it reaches "complete" (auto-advance or manual end).
  useEffect(() => {
    if (state.phase === "complete" && sessionIdRef.current && !sessionEndedRef.current) {
      sessionEndedRef.current = true;
      const absentees = members.filter((m) => state.absentIds.includes(m.id));
      endStandupSession(sessionIdRef.current, [
        ...state.speakerLog,
        ...absentees.map((a) => ({
          memberId: a.id,
          name: a.name,
          present: false,
          allottedSeconds: 0,
          usedSeconds: 0,
        })),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  async function handleMarkBlocker() {
    const speaker = state.speakers[state.currentIndex];
    if (!speaker || state.blockers.some((b) => b.memberId === speaker.id)) return;
    const localId = Math.random().toString(36).slice(2);
    dispatch({ type: "MARK_BLOCKER", localId });
    const dbId = await reportBlocker(sessionIdRef.current, speaker.id, speaker.name);
    dispatch({ type: "SET_BLOCKER_DB_ID", localId, dbId });
  }

  async function handleMarkCapacity() {
    const speaker = state.speakers[state.currentIndex];
    if (!speaker || state.capacity.some((c) => c.memberId === speaker.id)) return;
    const localId = Math.random().toString(36).slice(2);
    dispatch({ type: "MARK_CAPACITY", localId });
    const dbId = await reportCapacity(sessionIdRef.current, speaker.id, speaker.name);
    dispatch({ type: "SET_CAPACITY_DB_ID", localId, dbId });
  }

  function handleNoteChange(blockerId: string, dbId: string | null, note: string) {
    dispatch({ type: "UPDATE_BLOCKER_NOTE", id: blockerId, note });
    if (!dbId) return;
    if (noteTimers.current[blockerId]) clearTimeout(noteTimers.current[blockerId]);
    noteTimers.current[blockerId] = setTimeout(() => {
      updateBlockerNote(dbId, note);
    }, 600);
  }

  function handleRemoveBlocker(entry: BlockerEntry) {
    dispatch({ type: "REMOVE_BLOCKER", id: entry.id });
    if (entry.dbId) deleteBlocker(entry.dbId);
  }

  function handleRemoveCapacity(entry: CapacityEntry) {
    dispatch({ type: "REMOVE_CAPACITY", id: entry.id });
    if (entry.dbId) deleteCapacityOffer(entry.dbId);
  }

  function copyToClipboard() {
    const lines: string[] = [];
    lines.push(`Standup Notes — ${formatDate()}`);
    lines.push("");
    if (state.blockers.length > 0) {
      lines.push("People with blockers:");
      state.blockers.forEach((b) =>
        lines.push(`- ${b.name}${b.note ? `: ${b.note}` : ""}`),
      );
    }
    if (state.capacity.length > 0) {
      if (state.blockers.length > 0) lines.push("");
      lines.push("People with capacity to help:");
      state.capacity.forEach((c) => lines.push(`- ${c.name}`));
    }
    if (state.blockers.length === 0 && state.capacity.length === 0) {
      lines.push("No blockers or capacity reported.");
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const currentSpeaker = state.speakers[state.currentIndex];
  const key = (k: keyof ShortcutMap) => shortcuts[k].toUpperCase();

  return (
    <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-8 lg:px-10 lg:py-10">
      {/* Left: Questions */}
      <div className="shrink-0 lg:w-64">
        <h2 className="mb-2 text-sm font-semibold lg:mb-3">Questions for today</h2>
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

        {/* Shortcuts legend — hidden on mobile */}
        <div className="mt-8 hidden lg:block">
          <h3 className="mb-2 text-sm font-semibold">Shortcuts</h3>
          {state.phase === "idle" ? (
            <div className="flex flex-col gap-1.5">
              <KeyboardShortcut shortcutKey={key("default")} description="Default order" />
              <KeyboardShortcut shortcutKey={key("shuffled")} description="Shuffled order" />
            </div>
          ) : state.phase === "active" ? (
            <div className="flex flex-col gap-1.5">
              <KeyboardShortcut shortcutKey={key("blocker")} description="Mark blocker" />
              <KeyboardShortcut shortcutKey={key("capacity")} description="Mark capacity" />
              <KeyboardShortcut shortcutKey={key("next")} description="Next speaker" />
              <KeyboardShortcut shortcutKey={key("absent")} description="Mark absent" />
              <KeyboardShortcut shortcutKey={key("end")} description="End standup" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Center: Main content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {state.phase === "idle" && (
          <>
            <p className="text-sm text-muted-foreground lg:text-base">
              Daily meeting is about to start
            </p>
            <h1 className="mt-1 text-2xl font-bold lg:mt-2 lg:text-3xl">
              Select participants order
            </h1>
            <p className="mt-4 font-display text-5xl font-black tracking-wider lg:mt-8 lg:text-6xl">
              --:--
            </p>

            {members.length > 0 && (
              <div className="mt-6 w-full max-w-md lg:mt-8">
                <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
                  Who&apos;s here today?
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {members.map((m) => {
                    const absent = state.absentIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => dispatch({ type: "TOGGLE_ABSENT", id: m.id })}
                        className={cn(
                          "min-h-[36px] rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95",
                          absent
                            ? "border-border text-muted-foreground line-through hover:border-foreground/40 hover:bg-muted hover:text-foreground"
                            : "border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20",
                        )}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Tap a name to mark them absent. Everyone else counted as present.
                </p>
              </div>
            )}

            <div className="mt-4 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-4 lg:mt-8">
              <button
                onClick={() => startSession("default", presentMembers)}
                disabled={presentMembers.length === 0}
                className="min-h-[44px] rounded-button border border-secondary px-6 py-3 text-sm font-medium text-secondary transition-all hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98] disabled:opacity-50"
              >
                Default order<span className="hidden lg:inline"> ({key("default")})</span>
              </button>
              <button
                onClick={() => startSession("shuffled", presentMembers)}
                disabled={presentMembers.length === 0}
                className="min-h-[44px] rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-[0.98] disabled:opacity-50"
              >
                Shuffled order<span className="hidden lg:inline"> ({key("shuffled")})</span>
              </button>
            </div>
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
          </>
        )}

        {state.phase === "active" && currentSpeaker && (
          <>
            <p className="text-sm text-muted-foreground lg:text-base">
              Now speaking ({state.currentIndex + 1} of{" "}
              {state.speakers.length})
            </p>
            <h1 className="mt-1 text-3xl font-bold lg:mt-2 lg:text-4xl">{currentSpeaker.name}</h1>
            <div className="mt-4 flex items-center gap-3 lg:mt-6">
              <TimerDisplay
                minutes={minutes}
                seconds={seconds}
                warning={state.timeLeft <= 10}
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
              {state.isShuffled ? (
                <>
                  <Shuffle className="h-3.5 w-3.5" />
                  <span className="text-xs">Shuffled order</span>
                </>
              ) : (
                <>
                  <ListOrdered className="h-3.5 w-3.5" />
                  <span className="text-xs">Default order</span>
                </>
              )}
            </div>
            <div className="mt-4 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-4 lg:mt-8">
              <button
                onClick={handleMarkBlocker}
                className="min-h-[44px] rounded-button bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground transition-all hover:bg-destructive/90 active:scale-[0.98]"
              >
                Mark blocker<span className="hidden lg:inline"> ({key("blocker")})</span>
              </button>
              <button
                onClick={handleMarkCapacity}
                className="min-h-[44px] rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-[0.98]"
              >
                Mark capacity<span className="hidden lg:inline"> ({key("capacity")})</span>
              </button>
              <button
                onClick={() => dispatch({ type: "NEXT_SPEAKER" })}
                className="min-h-[44px] rounded-button border border-secondary px-6 py-3 text-sm font-medium text-secondary transition-all hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]"
              >
                Next speaker<span className="hidden lg:inline"> ({key("next")})</span>
              </button>
            </div>
            <button
              onClick={() => dispatch({ type: "MARK_ABSENT_CURRENT" })}
              className="mt-3 flex min-h-[36px] items-center gap-1.5 rounded-button px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
            >
              <UserX className="h-3.5 w-3.5" />
              {currentSpeaker.name} isn&apos;t actually here
              <span className="hidden lg:inline"> ({key("absent")})</span>
            </button>
          </>
        )}

        {state.phase === "complete" && (
          <>
            <p className="text-sm text-muted-foreground lg:text-base">Standup complete!</p>
            <h1 className="mt-1 text-2xl font-bold lg:mt-2 lg:text-3xl">Great job, team!</h1>
            <TimerDisplay minutes={0} seconds={0} className="mt-4 lg:mt-8" />
            <button
              onClick={() => dispatch({ type: "RETURN_TO_IDLE" })}
              className="mt-4 min-h-[44px] rounded-button bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/90 active:scale-[0.98] lg:mt-8"
            >
              Start new standup
            </button>
          </>
        )}
      </div>

      {/* Right: Blockers & Capacity */}
      <div className="shrink-0 lg:w-64">
        {(state.blockers.length > 0 || state.capacity.length > 0) && (
          <div className="mb-4 rounded-card bg-card p-3 lg:mb-6">
            <button
              onClick={copyToClipboard}
              className={cn(
                "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-button px-4 py-2 text-sm font-medium transition-all duration-200",
                copied
                  ? "bg-primary text-primary-foreground scale-[0.97]"
                  : "border border-primary text-primary hover:bg-primary/10",
              )}
            >
              {copied ? (
                <>
                  <ClipboardCheck className="h-4 w-4 animate-in zoom-in duration-200" />
                  Copied!
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Copy standup notes
                </>
              )}
            </button>
          </div>
        )}

        <div className="mb-4 lg:mb-8">
          <h2 className="mb-2 text-sm font-semibold lg:mb-3">People with blockers</h2>
          {state.blockers.length === 0 ? (
            <p className="text-sm text-muted-foreground">None</p>
          ) : (
            <div className="flex flex-col gap-2">
              {state.blockers.map((b) => (
                <div key={b.id} className="rounded-input bg-muted px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{b.name}</span>
                    <button
                      onClick={() => handleRemoveBlocker(b)}
                      className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-background hover:text-destructive active:scale-90"
                      aria-label="Remove blocker"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <MessageSquarePlus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <input
                      value={b.note}
                      onChange={(e) => handleNoteChange(b.id, b.dbId, e.target.value)}
                      placeholder="What's blocking them?"
                      className="min-h-[32px] w-full rounded-input border border-border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground transition-colors hover:border-foreground/30 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold lg:mb-3">
            People with capacity
          </h2>
          {state.capacity.length === 0 ? (
            <p className="text-sm text-muted-foreground">None</p>
          ) : (
            <div className="flex flex-col gap-2">
              {state.capacity.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-input bg-muted px-3 py-2"
                >
                  <span className="min-h-[32px] flex-1 text-sm leading-[32px]">{c.name}</span>
                  <button
                    onClick={() => handleRemoveCapacity(c)}
                    className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded-input text-muted-foreground transition-colors hover:bg-background hover:text-destructive active:scale-90"
                    aria-label="Remove capacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
