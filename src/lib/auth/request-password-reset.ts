import { createAdminClient } from "@/lib/supabase/admin";
import { getPasswordResetRedirectUrl } from "@/lib/auth/password-reset-url";
import {
  isSmtpConfigured,
  sendPasswordResetEmail,
} from "@/lib/email/send-password-reset";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function isUserNotFoundError(message: string): boolean {
  return message.toLowerCase().includes("not found");
}

export async function requestPasswordReset(
  email: string,
  origin: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const redirectTo = getPasswordResetRedirectUrl(origin);
  const supabase = createAdminClient();

  // 1) Prefer Supabase Auth email (uses SMTP configured in Supabase dashboard)
  const supabaseSend = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo,
  });

  if (!supabaseSend.error) {
    return { ok: true };
  }

  if (isUserNotFoundError(supabaseSend.error.message)) {
    return { ok: true };
  }

  // 2) Fallback: generate recovery link and send via app SMTP / Resend
  const { data, error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (linkError) {
    if (isUserNotFoundError(linkError.message)) {
      return { ok: true };
    }

    return {
      ok: false,
      error:
        supabaseSend.error.message ||
        linkError.message ||
        "Could not send password reset email",
    };
  }

  const resetUrl = data.properties?.action_link;
  if (!resetUrl) {
    return { ok: false, error: "Could not create password reset link" };
  }

  const sent = await sendPasswordResetEmail({
    to: normalizedEmail,
    resetUrl,
  });

  if (!sent.ok) {
    const hint = isSmtpConfigured()
      ? " Check SMTP credentials or Supabase Auth SMTP settings."
      : " Configure SMTP_HOST, SMTP_USER, and SMTP_PASS, or fix Supabase Auth SMTP.";

    return {
      ok: false,
      error: `${supabaseSend.error.message}. ${sent.error}.${hint}`,
    };
  }

  return { ok: true };
}
