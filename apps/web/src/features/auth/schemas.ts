import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email({ message: "Enter a valid email" });

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = loginSchema;
