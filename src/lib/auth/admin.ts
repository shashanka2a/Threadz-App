export const SESSION_COOKIE = "threadz_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "Demo@2026",
  };
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "threadz-admin-dev-secret"
  );
}

export function verifyCredentials(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return username === creds.username && password === creds.password;
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await hmacSha256Hex(issuedAt, getSessionSecret());
  return `${issuedAt}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE * 1000) return false;

  const expected = await hmacSha256Hex(issuedAt, getSessionSecret());
  return sig === expected;
}
