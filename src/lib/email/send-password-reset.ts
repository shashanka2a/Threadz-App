import { isSmtpConfigured, sendEmail } from "@/lib/email/transport";

type SendPasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

function getPasswordResetHtml(resetUrl: string): string {
  return `
    <div style="font-family: Georgia, serif; color: #111; max-width: 520px; margin: 0 auto;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">Reset your password</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">
        We received a request to reset your Threadz account password.
        Click the button below to choose a new password. This link expires soon.
      </p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 20px;">
          Reset password
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #666;">
        If you did not request this, you can ignore this email.
      </p>
      <p style="font-size: 12px; line-height: 1.6; color: #999; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
  `;
}

async function sendViaResend({
  to,
  resetUrl,
}: SendPasswordResetEmailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "Resend is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.EMAIL_FROM?.trim() ||
        process.env.RESEND_FROM?.trim() ||
        "Threadz Studio <onboarding@resend.dev>",
      to: [to],
      subject: "Reset your Threadz password",
      html: getPasswordResetHtml(resetUrl),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    return {
      ok: false,
      error: body?.message ?? `Email provider error (${response.status})`,
    };
  }

  return { ok: true };
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isSmtpConfigured()) {
    const smtpResult = await sendEmail({
      to: input.to,
      subject: "Reset your Threadz password",
      html: getPasswordResetHtml(input.resetUrl),
    });
    if (smtpResult.ok) return smtpResult;
  }

  const resendResult = await sendViaResend(input);
  if (resendResult.ok) return resendResult;

  return {
    ok: false,
    error: isSmtpConfigured()
      ? "Could not send password reset email via SMTP"
      : "Add SMTP_HOST, SMTP_USER, and SMTP_PASS to send password reset emails",
  };
}

export { isSmtpConfigured };
