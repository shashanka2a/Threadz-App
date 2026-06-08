import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Cookieless client for public reads/writes under RLS (products, orders). */
export function createPublicClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
