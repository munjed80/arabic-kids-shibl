import { describe, expect, it } from "vitest";
import { ensureParentSession } from "@/features/auth/guards";

describe("ensureParentSession", () => {
  it("allows when session has user id", () => {
    const result = ensureParentSession({
      user: { id: "1", email: "parent@example.com" },
      expires: "",
    });
    expect(result.allowed).toBe(true);
  });

  it("redirects when session missing", () => {
    const result = ensureParentSession(null);
    expect(result).toMatchObject({ allowed: false, redirectTo: "/login" });
  });
});
