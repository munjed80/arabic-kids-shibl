import nextAuthMiddleware from "next-auth/middleware";

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "dev-secret";
}

export const middleware = nextAuthMiddleware;

export const config = {
  matcher: ["/account"],
};
