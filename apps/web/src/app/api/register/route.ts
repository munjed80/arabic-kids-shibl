import { registerParent } from "@/features/auth/authService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await registerParent(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { ok: false, message: "A parent account already exists for this email." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, message: "Unable to register with those details right now." },
      { status: 400 },
    );
  }
}
