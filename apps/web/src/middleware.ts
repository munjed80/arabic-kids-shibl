import { authSecret } from "@/lib/authSecret";
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: authSecret,
});

export const config = {
  matcher: ["/account"],
};
