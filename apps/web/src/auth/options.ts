import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateParent } from "@/features/auth/service";
import { loginSchema } from "@/features/auth/schemas";
import { allowAttempt, resetAttempts } from "@/features/auth/rateLimiter";

function getClientIdentifier(req?: Request) {
  return (
    req?.headers.get("x-forwarded-for") ||
    req?.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const clientId = getClientIdentifier(req);
        if (!allowAttempt(clientId)) {
          throw new Error("Too many attempts. Please wait and try again.");
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await authenticateParent(parsed.data);
        if (user) {
          resetAttempts(clientId);
        }
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
