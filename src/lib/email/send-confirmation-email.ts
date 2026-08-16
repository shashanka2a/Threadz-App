import { sendEmail } from "@/lib/email/transport";

type SendConfirmationEmailInput = {
  to: string;
  confirmUrl: string;
  fullName?: string;
};

function getConfirmationHtml(confirmUrl: string, fullName?: string): string {
  const greeting = fullName?.trim() ? `Hi ${fullName.trim()},` : "Hi,";

  return `
    <div style="font-family: Georgia, serif; color: #111; max-width: 520px; margin: 0 auto;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">Confirm your Threadz account</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">
        ${greeting} thanks for signing up. Click the button below to confirm your email and finish creating your account.
      </p>
      <p style="margin: 28px 0;">
        <a href="${confirmUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 20px;">
          Confirm email
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #666;">
        If you did not create an account, you can ignore this email.
      </p>
      <p style="font-size: 12px; line-height: 1.6; color: #999; word-break: break-all;">
        ${confirmUrl}
      </p>
    </div>
  `;
}

export async function sendConfirmationEmail({
  to,
  confirmUrl,
  fullName,
}: SendConfirmationEmailInput): Promise<{ ok: true } | { ok: false; error: string }> {
  return sendEmail({
    to,
    subject: "Confirm your Threadz account",
    html: getConfirmationHtml(confirmUrl, fullName),
  });
}
