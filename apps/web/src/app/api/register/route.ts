import { NextResponse } from "next/server";
import { registerParentAccount } from "@/features/auth/service";
import { registerSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    const user = await registerParentAccount(parsed.data);

    return NextResponse.json(
      { message: "CREATED", user: { email: user.email } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (message === "EMAIL_IN_USE") {
      return NextResponse.json({ message: "EMAIL_IN_USE" }, { status: 409 });
    }
    return NextResponse.json({ message: "UNKNOWN_ERROR" }, { status: 400 });
  }
}
