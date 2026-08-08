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
