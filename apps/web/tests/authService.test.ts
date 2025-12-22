import { afterEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcrypt";
import { authenticateParent, registerParentAccount } from "@/features/auth/service";

const { userMock } = vi.hoisted(() => ({
  userMock: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: userMock,
  },
}));

describe("authenticateParent", () => {
  afterEach(() => {
    userMock.findUnique.mockReset();
  });

  it("returns user when password matches", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    userMock.findUnique.mockResolvedValue({
      id: 1,
      email: "parent@example.com",
      passwordHash,
    });

    const result = await authenticateParent({
      email: "parent@example.com",
      password: "password123",
    });

    expect(result).toMatchObject({ email: "parent@example.com" });
  });

  it("returns null on incorrect password", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    userMock.findUnique.mockResolvedValue({
      id: 1,
      email: "parent@example.com",
      passwordHash,
    });

    const result = await authenticateParent({
      email: "parent@example.com",
      password: "wrong",
    });

    expect(result).toBeNull();
  });
});

describe("registerParentAccount", () => {
  afterEach(() => {
    userMock.findUnique.mockReset();
    userMock.create.mockReset();
  });

  it("creates a new parent account with hashed password", async () => {
    userMock.findUnique.mockResolvedValue(null);
    userMock.create.mockResolvedValue({
      id: 2,
      email: "new@example.com",
      passwordHash: "hashed",
    });

    const result = await registerParentAccount({
      email: "new@example.com",
      password: "safePassword123",
    });

    expect(result.email).toBe("new@example.com");
    expect(userMock.create).toHaveBeenCalled();
  });

  it("throws when account already exists", async () => {
    userMock.findUnique.mockResolvedValue({
      id: 3,
      email: "dup@example.com",
      passwordHash: "hashed",
    });

    await expect(
      registerParentAccount({ email: "dup@example.com", password: "password123" }),
    ).rejects.toThrow("Account already exists");
  });
});
