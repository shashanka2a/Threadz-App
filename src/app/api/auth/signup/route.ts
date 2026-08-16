import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/register-user";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      redirectPath?: string;
    };

    const email = body.email?.trim();
    const password = body.password ?? "";
    const fullName = body.fullName?.trim() ?? "";
    const redirectPath = body.redirectPath?.trim() || "/profile";

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 },
      );
    }

    const result = await registerUser({
      email,
      password,
      fullName,
      redirectPath,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      needsConfirmation: result.needsConfirmation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
