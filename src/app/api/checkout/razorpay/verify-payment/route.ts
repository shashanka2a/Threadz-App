import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getRazorpayErrorMessage,
  getRazorpayErrorStatus,
  getRazorpayKeySecret,
  type VerifyPaymentBody,
} from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyPaymentBody;
    const secret = getRazorpayKeySecret();
    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const isValid = expected === body.razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ status: "payment_failed" }, { status: 400 });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);

    return NextResponse.json(
      { status: "error", message: getRazorpayErrorMessage(error) },
      { status: getRazorpayErrorStatus(error) },
    );
  }
}
