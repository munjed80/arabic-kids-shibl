import { authenticateParent, registerParentAccount } from "@/features/auth/service";
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

vi.mock("bcrypt", () => {
  const hash = vi.fn(async (value: string) => `hashed-${value}`);
  const compare = vi.fn(async (value: string, hashValue: string) => hashValue === `hashed-${value}`);
  return {
    __esModule: true,
    default: {
      hash,
      compare,
    },
    hash,
    compare,
  };
});

describe("auth flows", () => {
  beforeEach(() => {
    findUnique.mockReset();
    create.mockReset();
  });

  it("registers a new parent and hashes the password", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: 1, email: "parent@example.com" });

    const result = await registerParentAccount({
      email: "parent@example.com",
      password: "password123",
    });

    expect(create).toHaveBeenCalledWith({
      data: { email: "parent@example.com", passwordHash: "hashed-password123" },
    });
    expect(result.id).toBe("1");
  });

  it("prevents duplicate parent accounts", async () => {
    findUnique.mockResolvedValue({ id: 1, email: "parent@example.com" });

    await expect(
      registerParentAccount({ email: "parent@example.com", password: "password123" }),
    ).rejects.toThrow("Account already exists");
  });

  it("authenticates when credentials are valid", async () => {
    findUnique.mockResolvedValue({
      id: 1,
      email: "parent@example.com",
      passwordHash: "hashed-password123",
    });

    const result = await authenticateParent({
      email: "parent@example.com",
      password: "password123",
    });

    expect(result?.id).toBe("1");
  });

  it("returns null when password is invalid", async () => {
    findUnique.mockResolvedValue({
      id: 1,
      email: "parent@example.com",
      passwordHash: "hashed-password123",
    });

    const result = await authenticateParent({
      email: "parent@example.com",
      password: "wrong",
    });

    expect(result).toBeNull();
  });
});
