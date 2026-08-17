import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getRequestOrigin } from "@/lib/auth/password-reset-url";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/env";

function safeNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const fallbackDestination = type === "recovery" ? "/reset-password" : "/profile";
  const next = safeNextPath(searchParams.get("next"), fallbackDestination);
  const origin = getRequestOrigin(request);
  const redirectUrl = `${origin}${next}`;

  if (!code && !(tokenHash && type)) {
    const fallbackPath = next === "/reset-password" || type === "recovery" ? "/forgot-password" : "/login";
    return NextResponse.redirect(`${origin}${fallbackPath}?error=auth_callback_failed`);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: type as EmailOtpType,
      });

  if (error) {
    const fallbackPath = next === "/reset-password" ? "/forgot-password" : "/login";
    return NextResponse.redirect(`${origin}${fallbackPath}?error=auth_callback_failed`);
  }

  return response;
}
