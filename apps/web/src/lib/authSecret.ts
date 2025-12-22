const isProduction = process.env.NODE_ENV === "production";
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!process.env.NEXTAUTH_SECRET && isProduction && !isBuildPhase) {
  throw new Error("NEXTAUTH_SECRET must be set in production");
}

export const authSecret = process.env.NEXTAUTH_SECRET ?? "development-parent-auth-secret";
