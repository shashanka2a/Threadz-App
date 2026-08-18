import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { processRazorpayRefund } from "@/lib/razorpay-refund";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      paymentId?: string;
      amountInRupees?: number;
      reason?: string;
      notes?: Record<string, string>;
    };

    const result = await processRazorpayRefund({
      orderId,
      paymentId: body.paymentId,
      amountInRupees: body.amountInRupees,
      reason: body.reason,
      notes: body.notes,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      refundId: result.refundId,
      paymentId: result.paymentId,
      amount: result.amount,
      currency: result.currency,
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process refund";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
