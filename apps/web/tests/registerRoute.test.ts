import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("register route", () => {
  const originalPath = process.env.USER_STORE_PATH;
  let tempFile: string;

  beforeEach(async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "register-route-"));
    tempFile = path.join(tempDir, "users.json");
    process.env.USER_STORE_PATH = tempFile;
    vi.resetModules();
  });

  afterEach(() => {
    process.env.USER_STORE_PATH = originalPath;
  });

  it("rejects duplicate email addresses", async () => {
    const store = await import("@/features/auth/userStore");
    await store.createUser("parent@example.com", "password123");

    const { POST } = await import("@/app/api/register/route");
    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "parent@example.com",
          password: "password123",
          confirmPassword: "password123",
        }),
      }),
    );

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.message).toBe("EMAIL_IN_USE");
  });
});
