import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type UserStore = {
  users: StoredUser[];
};

const getUsersFilePath = () =>
  process.env.USER_STORE_PATH ?? path.join(process.cwd(), "src/data/users.json");

const ensureStore = async (): Promise<UserStore> => {
  const filePath = getUsersFilePath();
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as Partial<UserStore>;
    if (parsed && Array.isArray(parsed.users)) {
      return { users: parsed.users };
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to read users store", error);
    }
  }
  return { users: [] };
};

const persistStore = async (store: UserStore) => {
  const filePath = getUsersFilePath();
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(store, null, 2));
};

export const getUserByEmail = async (email: string) => {
  const store = await ensureStore();
  const normalized = email.trim().toLowerCase();
  return store.users.find((user) => user.email.toLowerCase() === normalized) ?? null;
};

export const createUser = async (email: string, password: string): Promise<StoredUser> => {
  const store = await ensureStore();
  const normalized = email.trim().toLowerCase();

  const existing = store.users.find((user) => user.email.toLowerCase() === normalized);
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user: StoredUser = {
    id: randomUUID(),
    email: normalized,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  await persistStore(store);
  return user;
};

export const verifyUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
};
