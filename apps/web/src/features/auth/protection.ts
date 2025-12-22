import type { Session } from "next-auth";

export function canAccessProtected(session: Session | null) {
  return Boolean(session?.user?.email);
}
