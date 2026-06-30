import { createClient } from "@/lib/supabase/server";

export async function requireUserEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error("Unauthorized");
  }

  return user.email;
}
