import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, type CreateOrderBody } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const options = {
      amount: Math.round((body.amount ?? 0) * 100),
      currency: body.currency ?? "INR",
      receipt: body.receipt,
      notes: body.notes,
    };

    const order = await getRazorpayClient().orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    if (error instanceof Error && error.message === "Razorpay credentials are not configured") {
      return NextResponse.json({ error: "Payment service is not configured" }, { status: 503 });
    }

    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
