import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("auth schemas", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({ email: "parent@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "invalid", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("requires matching passwords on register", () => {
    const result = registerSchema.safeParse({
      email: "parent@example.com",
      password: "password123",
      confirmPassword: "mismatch",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords on register", () => {
    const result = registerSchema.safeParse({
      email: "parent@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});
