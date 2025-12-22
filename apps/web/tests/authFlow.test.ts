import {
  authenticateParent,
  registerParent,
  resolveRateLimitKey,
} from "@/features/auth/authService";
import { resetAllLoginBuckets } from "@/features/auth/rateLimiter";
import { describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn(async (value: string) => `hashed-${value}`),
  compare: vi.fn(async (value: string, hashValue: string) => hashValue === `hashed-${value}`),
}));

describe("auth flows", () => {
  beforeEach(() => {
    findUnique.mockReset();
    create.mockReset();
    resetAllLoginBuckets();
  });

  it("registers a new parent and hashes the password", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "user-1", email: "parent@example.com" });

    const result = await registerParent({ email: "parent@example.com", password: "password123" });

    expect(create).toHaveBeenCalledWith({
      data: { email: "parent@example.com", passwordHash: "hashed-password123" },
    });
    expect(result.id).toBe("user-1");
  });

  it("prevents duplicate parent accounts", async () => {
    findUnique.mockResolvedValue({ id: "existing", email: "parent@example.com" });

    await expect(
      registerParent({ email: "parent@example.com", password: "password123" }),
    ).rejects.toThrow("EMAIL_EXISTS");
  });

  it("authenticates when credentials are valid and under rate limit", async () => {
    findUnique.mockResolvedValue({
      id: "user-1",
      email: "parent@example.com",
      passwordHash: "hashed-password123",
    });

    const result = await authenticateParent(
      { email: "parent@example.com", password: "password123" },
      resolveRateLimitKey("parent@example.com", null),
    );

    expect(result?.id).toBe("user-1");
  });

  it("blocks logins after repeated failures", async () => {
    findUnique.mockResolvedValue({
      id: "user-1",
      email: "parent@example.com",
      passwordHash: "hashed-password123",
    });

    for (let i = 0; i < 5; i++) {
      const result = await authenticateParent(
        { email: "parent@example.com", password: "wrong-pass" },
        "ip-key",
      );
      expect(result).toBeNull();
    }

    const blocked = await authenticateParent(
      { email: "parent@example.com", password: "password123" },
      "ip-key",
    );
    expect(blocked).toBeNull();
  });
});
