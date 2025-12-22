import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { allowAttempt, resetAttempts } from "./rateLimiter";
import { loginSchema, registerSchema } from "./schemas";

const HASH_ROUNDS = 12;

export async function registerParent(input: unknown) {
  const parsed = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(parsed.password, HASH_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      passwordHash,
    },
  });

  return { id: String(user.id), email: user.email };
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
  if (!allowAttempt(rateKey)) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return null;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return null;
  }

  resetAttempts(rateKey);
  return { id: String(user.id), email: user.email };
}

export function resolveRateLimitKey(email?: string, ip?: string | null) {
  if (ip) return ip;
  if (email) return email;
  return "anonymous";
}
