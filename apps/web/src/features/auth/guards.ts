import type { Session } from "next-auth";

type GuardResult =
  | { allowed: true }
  | {
      allowed: false;
      redirectTo: string;
    };

export function ensureParentSession(session: Session | null): GuardResult {
  if (session?.user?.id) {
    return { allowed: true };
  }
  return { allowed: false, redirectTo: "/login" };
}
