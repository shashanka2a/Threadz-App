import Razorpay from "razorpay";

export interface CreateOrderBody {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type RazorpayApiError = {
  statusCode?: number;
  error?: {
    code?: string;
    description?: string;
  };
};

let razorpayClient: Razorpay | null = null;

function getRazorpayCredentials() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return { key_id, key_secret };
}

export function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    const { key_id, key_secret } = getRazorpayCredentials();
    razorpayClient = new Razorpay({ key_id, key_secret });
  }

  return razorpayClient;
}

export function getRazorpayKeySecret(): string {
  return getRazorpayCredentials().key_secret;
}

export function getRazorpayErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Razorpay credentials are not configured") {
    return "Payment service is not configured on the server";
  }

  const razorpayError = error as RazorpayApiError;
  const description = razorpayError.error?.description;

  if (razorpayError.statusCode === 401) {
    return "Razorpay authentication failed. Verify Key ID and Key Secret in server env vars.";
  }

  if (description) {
    return description;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to process payment";
}

export function getRazorpayErrorStatus(error: unknown): number {
  if (error instanceof Error && error.message === "Razorpay credentials are not configured") {
    return 503;
  }

  const razorpayError = error as RazorpayApiError;
  if (razorpayError.statusCode === 401) {
    return 502;
  }

  if (razorpayError.statusCode === 400) {
    return 400;
  }

  return 500;
}

/** Razorpay minimum order amount is ₹1 (100 paise). */
export function toRazorpayAmountPaise(amountInRupees: number): number {
  return Math.max(100, Math.round(amountInRupees * 100));
}

export function sanitizeReceipt(receipt?: string): string {
  const base = (receipt ?? `TZ-${Date.now()}`).replace(/[^\w-]/g, "").slice(0, 40);
  return base || `TZ${Date.now()}`.slice(0, 40);
}
