import { createAdminClient } from "@/lib/supabase/admin";
import { getPasswordResetRedirectUrl } from "@/lib/auth/password-reset-url";
import {
  isSmtpConfigured,
  sendPasswordResetEmail,
} from "@/lib/email/send-password-reset";
import { getSiteUrl } from "@/lib/site-url";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function isUserNotFoundError(message: string): boolean {
  return message.toLowerCase().includes("not found");
}

async function sendRecoveryEmail(
  email: string,
  redirectTo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (error) {
    if (isUserNotFoundError(error.message)) {
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  const resetUrl = data.properties?.action_link;
  if (!resetUrl) {
    return { ok: false, error: "Could not create password reset link" };
  }

  return sendPasswordResetEmail({ to: email, resetUrl });
}

export async function requestPasswordReset(
  email: string,
  _origin?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const redirectTo = getPasswordResetRedirectUrl(getSiteUrl());

  if (isSmtpConfigured()) {
    const sent = await sendRecoveryEmail(normalizedEmail, redirectTo);
    if (sent.ok) return { ok: true };

    const supabase = createAdminClient();
    const fallback = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (!fallback.error || isUserNotFoundError(fallback.error.message)) {
      return { ok: true };
    }

    return { ok: false, error: sent.error };
  }

  const supabase = createAdminClient();
  const supabaseSend = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (!supabaseSend.error || isUserNotFoundError(supabaseSend.error.message)) {
    return { ok: true };
  }

  const sent = await sendRecoveryEmail(normalizedEmail, redirectTo);
  if (sent.ok) return { ok: true };

  return {
    ok: false,
    error: supabaseSend.error.message || sent.error,
  };
}
