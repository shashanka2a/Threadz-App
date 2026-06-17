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
    "/login",
    "/signup",
    "/checkout/:path*",
    "/cart",
    "/shop/:path*",
    "/product/:path*",
    "/",
  ],
};
