import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/auth/password-reset-url";
import { requestPasswordReset } from "@/lib/auth/request-password-reset";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const origin = getRequestOrigin(request);
    const result = await requestPasswordReset(email, origin);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Password reset request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
