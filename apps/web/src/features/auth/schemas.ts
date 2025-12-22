import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "auth.invalidCredentials" });

export const passwordSchema = z
  .string()
  .min(8, "auth.passwordTooShort")
  .max(72, "auth.passwordTooLong");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "auth.passwordsDontMatch",
  });
