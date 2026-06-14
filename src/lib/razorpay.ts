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

let razorpayClient: Razorpay | null = null;

function getRazorpayCredentials() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

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
