import { NextResponse } from "next/server";
import { registerParentAccount } from "@/features/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerParentAccount(body);

    return NextResponse.json(
      { message: "Account created", user: { email: user.email } },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register";
    const status = message === "Account already exists" ? 409 : 400;
    return NextResponse.json({ message }, { status });
  }
}
