import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/auth/password-reset-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";
  const origin = getRequestOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith("/") ? next : "/profile";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  const fallbackPath = next === "/reset-password" ? "/forgot-password" : "/login";
  return NextResponse.redirect(`${origin}${fallbackPath}?error=auth_callback_failed`);
}
