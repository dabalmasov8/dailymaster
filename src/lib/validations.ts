import { z } from "zod";

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  position: z.string().trim().max(100).default(""),
});

export const questionSchema = z.object({
  text: z.string().trim().min(1, "Question text is required").max(500),
});

export const durationSchema = z.object({
  minutes: z.number().int().min(0).max(10),
  seconds: z.number().int().refine((s) => [0, 15, 30, 45].includes(s), {
    message: "Seconds must be 0, 15, 30, or 45",
  }),
});
