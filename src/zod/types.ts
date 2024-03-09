import { z } from "zod";

export const teamSchema = z.object({
  teamId: z.number(),
  teamPassword: z.string(),
});

export const adminSchema = z.object({
  adminId: z.string(),
  adminPassword: z.string(),
});

export const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.number(),
});

export type adminCredentialsType = z.infer<typeof adminSchema>;
export type teamDataType = z.infer<typeof teamSchema>;
export type questionType = z.infer<typeof questionSchema>;
