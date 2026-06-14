"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  teamMemberSchema,
  questionSchema,
  durationSchema,
} from "@/lib/validations";
import type { TeamMember, Question, ActionResult } from "@/types";

function generateId() {
  return crypto.randomUUID();
}

// Prisma v7 JSON fields need plain JSON values, not typed arrays
function toJson<T>(data: T) {
  return JSON.parse(JSON.stringify(data));
}

// --- Team Members ---

export async function addTeamMember(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = teamMemberSchema.safeParse({
    name: formData.get("name"),
    position: formData.get("position"),
  });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];
  members.push({ id: generateId(), ...parsed.data });
  await db.user.update({
    where: { id: user.id },
    data: { teamMembers: toJson(members) },
  });
  revalidatePath("/settings/participants");
  return { success: true };
}

export async function updateTeamMember(
  id: string,
  name: string,
  position: string,
): Promise<ActionResult> {
  const parsed = teamMemberSchema.safeParse({ name, position });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  const members = user.teamMembers as unknown as TeamMember[];
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return { success: false, error: "Member not found" };
  members[idx] = { ...members[idx], ...parsed.data };
  await db.user.update({
    where: { id: user.id },
    data: { teamMembers: toJson(members) },
  });
  revalidatePath("/settings/participants");
  return { success: true };
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  const user = await getOrCreateUser();
  const members = (user.teamMembers as unknown as TeamMember[]).filter(
    (m) => m.id !== id,
  );
  await db.user.update({
    where: { id: user.id },
    data: { teamMembers: toJson(members) },
  });
  revalidatePath("/settings/participants");
  return { success: true };
}

// --- Standup Questions ---

export async function addStandupQuestion(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = questionSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  const questions = user.questions as unknown as Question[];
  questions.push({ id: generateId(), text: parsed.data.text });
  await db.user.update({
    where: { id: user.id },
    data: { questions: toJson(questions) },
  });
  revalidatePath("/settings/standup");
  return { success: true };
}

export async function updateStandupQuestion(
  id: string,
  text: string,
): Promise<ActionResult> {
  const parsed = questionSchema.safeParse({ text });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  const questions = user.questions as unknown as Question[];
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return { success: false, error: "Question not found" };
  questions[idx] = { ...questions[idx], text: parsed.data.text };
  await db.user.update({
    where: { id: user.id },
    data: { questions: toJson(questions) },
  });
  revalidatePath("/settings/standup");
  return { success: true };
}

export async function deleteStandupQuestion(id: string): Promise<ActionResult> {
  const user = await getOrCreateUser();
  const questions = (user.questions as unknown as Question[]).filter((q) => q.id !== id);
  await db.user.update({
    where: { id: user.id },
    data: { questions: toJson(questions) },
  });
  revalidatePath("/settings/standup");
  return { success: true };
}

// --- Standup Duration ---

export async function updateStandupDuration(
  minutes: number,
  seconds: number,
): Promise<ActionResult> {
  const parsed = durationSchema.safeParse({ minutes, seconds });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  await db.user.update({
    where: { id: user.id },
    data: {
      standupDurationMinutes: parsed.data.minutes,
      standupDurationSeconds: parsed.data.seconds,
    },
  });
  revalidatePath("/settings/standup");
  return { success: true };
}

// --- Newcomer Intro Questions ---

export async function addNewcomerQuestion(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = questionSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  const questions = user.newcomerIntroQuestions as unknown as Question[];
  questions.push({ id: generateId(), text: parsed.data.text });
  await db.user.update({
    where: { id: user.id },
    data: { newcomerIntroQuestions: toJson(questions) },
  });
  revalidatePath("/settings/newcomer");
  return { success: true };
}

export async function updateNewcomerQuestion(
  id: string,
  text: string,
): Promise<ActionResult> {
  const parsed = questionSchema.safeParse({ text });
  if (!parsed.success)
    return { success: false, error: parsed.error.errors[0].message };

  const user = await getOrCreateUser();
  const questions = user.newcomerIntroQuestions as unknown as Question[];
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return { success: false, error: "Question not found" };
  questions[idx] = { ...questions[idx], text: parsed.data.text };
  await db.user.update({
    where: { id: user.id },
    data: { newcomerIntroQuestions: toJson(questions) },
  });
  revalidatePath("/settings/newcomer");
  return { success: true };
}

export async function deleteNewcomerQuestion(
  id: string,
): Promise<ActionResult> {
  const user = await getOrCreateUser();
  const questions = (user.newcomerIntroQuestions as unknown as Question[]).filter(
    (q) => q.id !== id,
  );
  await db.user.update({
    where: { id: user.id },
    data: { newcomerIntroQuestions: toJson(questions) },
  });
  revalidatePath("/settings/newcomer");
  return { success: true };
}
