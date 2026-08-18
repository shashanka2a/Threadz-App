import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (typeof window === "undefined") {
    return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseKey());
  }

  if (!client) {
    client = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseKey());
  }

  return client;
}

