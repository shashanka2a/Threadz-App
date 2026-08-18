import { NextResponse, type NextRequest } from "next/server";
import { requireUserEmail } from "@/lib/auth/require-user";
import { requestOrderReturn } from "@/lib/db/order-returns";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = await requireUserEmail();
    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as { reason?: string };

    const result = await requestOrderReturn(orderId, {
      isCustomer: true,
      userEmail,
      reason: body.reason,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit return request";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
