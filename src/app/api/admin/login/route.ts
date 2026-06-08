import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyCredentials,
} from "@/lib/auth/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };

    if (!body.username || !body.password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    if (!verifyCredentials(body.username, body.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
