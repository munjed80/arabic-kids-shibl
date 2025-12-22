import { authenticateParent, resolveRateLimitKey } from "@/features/auth/authService";
import { loginSchema } from "@/features/auth/schemas";
import { authSecret } from "@/lib/authSecret";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const getClientIp = (headers?: Record<string, string | string[] | undefined>) => {
  const forwarded = headers?.["x-forwarded-for"];
  if (!forwarded) return undefined;
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim();
};

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-parent-session-token"
          : "parent-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Parent credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const ip = getClientIp(req?.headers as Record<string, string | undefined>);
        const rateKey = resolveRateLimitKey(parsed.data.email, ip);
        const user = await authenticateParent(parsed.data, rateKey);
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id !== "string" || typeof token.email !== "string") {
          throw new Error("Invalid authentication token");
        }
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
};
