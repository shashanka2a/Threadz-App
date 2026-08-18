import { NextResponse, type NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { scheduleDelhiveryReturnPickup } from "@/lib/db/order-returns";

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
      pickupDate?: string;
      pickupTime?: string;
      expectedPackageCount?: number;
    };

    const result = await scheduleDelhiveryReturnPickup(orderId, {
      pickupDate: body.pickupDate,
      pickupTime: body.pickupTime,
      expectedPackageCount: body.expectedPackageCount,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      pickupId: result.pickupId,
      waybill: result.waybill,
      message: result.message,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to schedule pickup";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
