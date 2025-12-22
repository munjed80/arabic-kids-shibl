import { loginSchema, registerSchema } from "./schemas";
import { createUser, verifyUser } from "./userStore";

type Credentials = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export async function authenticateParent(credentials: Credentials) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await verifyUser(parsed.data.email, parsed.data.password);
  if (!user) return null;

  return { id: String(user.id), email: user.email };
}

export async function registerParentAccount(input: Credentials) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("INVALID_INPUT");
  }

  const user = await createUser(parsed.data.email, parsed.data.password);
  return { id: String(user.id), email: user.email };
}
