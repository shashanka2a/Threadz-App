import { NextResponse, type NextRequest } from "next/server";
import { requireUserEmail } from "@/lib/auth/require-user";
import { cancelOrder } from "@/lib/db/order-cancellation";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = await requireUserEmail();
    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = await cancelOrder(orderId, {
      isCustomer: true,
      userEmail,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      restockedItemsCount: result.restockedItemsCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
