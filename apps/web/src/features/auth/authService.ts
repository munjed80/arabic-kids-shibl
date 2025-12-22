import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import {
  canAttemptLogin,
  recordFailedLogin,
  resetLoginAttempts,
} from "./rateLimiter";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./schemas";

const HASH_ROUNDS = 10;

export async function registerParent(input: unknown) {
  const parsed = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await hash(parsed.password, HASH_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      passwordHash,
    },
  });

  return { id: user.id, email: user.email };
}

export async function authenticateParent(
  credentials: unknown,
  key?: string,
): Promise<{ id: string; email: string } | null> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return null;
  }

  const rateKey = key ?? parsed.data.email;
  if (!canAttemptLogin(rateKey)) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    recordFailedLogin(rateKey);
    return null;
  }

  const valid = await compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    recordFailedLogin(rateKey);
    return null;
  }

  resetLoginAttempts(rateKey);
  return { id: user.id, email: user.email };
}

export function resolveRateLimitKey(email?: string, ip?: string | null) {
  if (ip) return ip;
  if (email) return email;
  return "anonymous";
}

export type { LoginInput, RegisterInput };
