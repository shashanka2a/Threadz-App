import { NextRequest, NextResponse } from "next/server";
import {
  getRazorpayClient,
  getRazorpayErrorMessage,
  getRazorpayErrorStatus,
  sanitizeReceipt,
  toRazorpayAmountPaise,
  type CreateOrderBody,
} from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const options = {
      amount: toRazorpayAmountPaise(body.amount),
      currency: body.currency ?? "INR",
      receipt: sanitizeReceipt(body.receipt),
      notes: body.notes,
    };

    const order = await getRazorpayClient().orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    return NextResponse.json(
      { error: getRazorpayErrorMessage(error) },
      { status: getRazorpayErrorStatus(error) },
    );
  }
}
