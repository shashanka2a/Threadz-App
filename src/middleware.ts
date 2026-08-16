import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/inventory/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/my-orders/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
