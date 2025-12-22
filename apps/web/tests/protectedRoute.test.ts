import { canAccessProtected } from "@/features/auth/protection";
import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";

describe("protected routes", () => {
  it("denies access when no session is present", () => {
    expect(canAccessProtected(null)).toBe(false);
  });

  it("allows access when a parent user is present", () => {
    const session: Session = {
      user: { id: "user-1", email: "parent@example.com" },
      expires: new Date().toISOString(),
    };
    expect(canAccessProtected(session)).toBe(true);
  });
});
