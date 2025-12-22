import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
