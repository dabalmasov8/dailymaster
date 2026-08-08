export interface TeamMember {
  id: string;
  name: string;
  position: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface SessionParticipant {
  memberId: string;
  name: string;
  present: boolean;
  allottedSeconds: number;
  usedSeconds: number;
}

export type BlockerStatus = "new" | "in_progress" | "resolved" | "wont_fix";

export interface BlockerComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface BlockerRecord {
  id: string;
  memberId: string;
  memberName: string;
  note: string;
  status: BlockerStatus;
  reportedAt: string;
  resolvedAt: string | null;
  resolutionNote: string;
  comments: BlockerComment[];
}

export type ShortcutAction =
  | "default"
  | "shuffled"
  | "blocker"
  | "capacity"
  | "next"
  | "absent"
  | "end";

export type ShortcutMap = Record<ShortcutAction, string>;

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  default: "d",
  shuffled: "s",
  blocker: "b",
  capacity: "c",
  next: "n",
  absent: "a",
  end: "v",
};

export const SHORTCUT_LABELS: Record<ShortcutAction, string> = {
  default: "Start (default order)",
  shuffled: "Start (shuffled order)",
  blocker: "Mark blocker",
  capacity: "Mark capacity",
  next: "Next speaker",
  absent: "Mark current speaker absent",
  end: "End standup",
};
