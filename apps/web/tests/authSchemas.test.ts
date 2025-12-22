import { describe, expect, it } from "vitest";
import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("auth schemas", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({ email: "parent@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({ email: "parent@example.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });
});
