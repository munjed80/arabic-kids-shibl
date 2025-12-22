import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "./schemas";

type Credentials = {
  email?: string;
  password?: string;
};

export async function authenticateParent(credentials: Credentials) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) return null;

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return null;

  return { id: String(user.id), email: user.email };
}

export async function registerParentAccount(input: Credentials) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid registration details");
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    throw new Error("Account already exists");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
    },
  });

  return { id: String(user.id), email: user.email };
}
