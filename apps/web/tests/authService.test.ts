import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { authenticateParent, registerParentAccount } from "@/features/auth/service";

describe("auth service", () => {
  const originalPath = process.env.USER_STORE_PATH;
  let tempFile: string;

  beforeEach(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "auth-service-"));
    tempFile = path.join(tempDir, "users.json");
    process.env.USER_STORE_PATH = tempFile;
    vi.resetModules();
  });

  afterEach(() => {
    process.env.USER_STORE_PATH = originalPath;
  });

  it("authenticates a parent with correct credentials", async () => {
    await registerParentAccount({
      email: "parent@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const sessionUser = await authenticateParent({
      email: "parent@example.com",
      password: "password123",
    });

    expect(sessionUser?.email).toBe("parent@example.com");
  });

  it("returns null on incorrect password", async () => {
    await registerParentAccount({
      email: "parent@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const sessionUser = await authenticateParent({
      email: "parent@example.com",
      password: "wrong",
    });

    expect(sessionUser).toBeNull();
  });
});
