import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("userStore", () => {
  const originalPath = process.env.USER_STORE_PATH;
  let tempFile: string;

  beforeEach(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "user-store-"));
    tempFile = path.join(tempDir, "users.json");
    process.env.USER_STORE_PATH = tempFile;
    vi.resetModules();
  });

  afterEach(() => {
    process.env.USER_STORE_PATH = originalPath;
  });

  it("creates a user with a hashed password and can verify it", async () => {
    const store = await import("@/features/auth/userStore");
    const user = await store.createUser("parent@example.com", "password123");

    expect(user.email).toBe("parent@example.com");
    const fileContents = JSON.parse(await fs.readFile(tempFile, "utf-8"));
    expect(fileContents.users).toHaveLength(1);
    expect(fileContents.users[0].passwordHash).not.toBe("password123");

    const verified = await store.verifyUser("parent@example.com", "password123");
    expect(verified?.email).toBe("parent@example.com");
  });

  it("returns null for incorrect credentials", async () => {
    const store = await import("@/features/auth/userStore");
    await store.createUser("parent@example.com", "password123");
    const verified = await store.verifyUser("parent@example.com", "wrong");
    expect(verified).toBeNull();
  });
});
