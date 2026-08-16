import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/env";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/admin";

const ADMIN_PREFIXES = ["/inventory", "/orders"];
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

const PROTECTED_CUSTOMER_PREFIXES = ["/profile", "/my-orders", "/checkout"];

function needsAuthCheck(pathname: string): boolean {
  if (AUTH_PAGES.includes(pathname)) return true;
  if (pathname === "/reset-password") return false;
  return PROTECTED_CUSTOMER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const isAuthenticated = await verifySessionToken(token);

    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  if (!needsAuthCheck(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/my-orders" || pathname.startsWith("/my-orders/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (AUTH_PAGES.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return supabaseResponse;
}
