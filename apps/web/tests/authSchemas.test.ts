import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("auth schemas", () => {
  it("accepts valid email and password", () => {
    const parsed = loginSchema.parse({ email: "parent@example.com", password: "password123" });
    expect(parsed.email).toBe("parent@example.com");
  });

  it("rejects short passwords", () => {
    expect(() => registerSchema.parse({ email: "parent@example.com", password: "short" })).toThrow();
  });

  it("rejects invalid emails", () => {
    expect(() => loginSchema.parse({ email: "not-an-email", password: "password123" })).toThrow();
  });
});
