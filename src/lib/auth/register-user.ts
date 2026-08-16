import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/email/send-confirmation-email";
import { isSmtpConfigured } from "@/lib/email/transport";
import { getAuthCallbackUrl } from "@/lib/site-url";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function isAlreadyRegisteredError(message: string): boolean {
  return message.toLowerCase().includes("already been registered");
}

async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === email,
    );
    if (match) return match;

    if (data.users.length < 200) return null;
    page += 1;
  }

  return null;
}

async function createSignupLink(
  email: string,
  password: string,
  fullName: string,
  redirectTo: string,
) {
  const supabase = createAdminClient();

  return supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { full_name: fullName },
      redirectTo,
    },
  });
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  redirectPath?: string;
}): Promise<
  | { ok: true; needsConfirmation: true }
  | { ok: true; needsConfirmation: false }
  | { ok: false; error: string }
> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const redirectPath = input.redirectPath ?? "/profile";
  const redirectTo = getAuthCallbackUrl(redirectPath);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  if (!fullName) {
    return { ok: false, error: "Full name is required" };
  }

  if (!isSmtpConfigured()) {
    return {
      ok: false,
      error: "Account confirmation email is not configured on the server.",
    };
  }

  let linkResult = await createSignupLink(
    normalizedEmail,
    input.password,
    fullName,
    redirectTo,
  );

  if (linkResult.error && isAlreadyRegisteredError(linkResult.error.message)) {
    const existing = await findUserByEmail(normalizedEmail);

    if (existing?.email_confirmed_at) {
      return {
        ok: false,
        error: "An account with this email already exists. Sign in instead.",
      };
    }

    if (existing?.id) {
      const supabase = createAdminClient();
      await supabase.auth.admin.deleteUser(existing.id);
      linkResult = await createSignupLink(
        normalizedEmail,
        input.password,
        fullName,
        redirectTo,
      );
    }
  }

  if (linkResult.error) {
    return { ok: false, error: linkResult.error.message };
  }

  const confirmUrl = linkResult.data.properties?.action_link;
  const createdUserId = linkResult.data.user?.id;

  if (!confirmUrl) {
    if (createdUserId) {
      await createAdminClient().auth.admin.deleteUser(createdUserId);
    }
    return { ok: false, error: "Could not create confirmation link" };
  }

  const sent = await sendConfirmationEmail({
    to: normalizedEmail,
    confirmUrl,
    fullName,
  });

  if (!sent.ok) {
    if (createdUserId) {
      await createAdminClient().auth.admin.deleteUser(createdUserId);
    }
    return { ok: false, error: sent.error };
  }

  return { ok: true, needsConfirmation: true };
}
