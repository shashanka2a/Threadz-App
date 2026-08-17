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
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const fallbackDestination = type === "recovery" ? "/reset-password" : "/profile";
  const next = safeNextPath(searchParams.get("next"), fallbackDestination);
  const origin = getRequestOrigin(request);
  const redirectUrl = `${origin}${next}`;

  // If Supabase returned an explicit error parameter
  if (errorParam) {
    const fallbackPath = next === "/reset-password" || type === "recovery" ? "/forgot-password" : "/login";
    return NextResponse.redirect(`${origin}${fallbackPath}?error=${encodeURIComponent(errorDescription || errorParam)}`);
  }

  // If neither code nor tokenHash is present, forward to destination (allows client-side hash auth)
  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(redirectUrl);
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
    const fallbackPath = next === "/reset-password" || type === "recovery" ? "/forgot-password" : "/login";
    return NextResponse.redirect(`${origin}${fallbackPath}?error=${encodeURIComponent(error.message)}`);
  }

  return response;
}
