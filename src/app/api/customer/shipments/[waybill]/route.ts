import { NextResponse } from "next/server";
import { requireUserEmail } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import {
  cancelShipment,
  fetchPackingSlip,
  trackShipment,
} from "@/lib/delhivery";
import {
  getShipmentByWaybill,
  updateShipmentRecord,
} from "@/lib/db/shipments";

async function assertOwnShipment(waybill: string, email: string) {
  const supabase = await createClient();
  const shipment = await getShipmentByWaybill(waybill);
  if (!shipment) throw new Error("Shipment not found");

  const { data: order } = await supabase
    .from("orders")
    .select("email")
    .eq("id", shipment.orderId)
    .single();

  if (!order || order.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Forbidden");
  }

  return shipment;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ waybill: string }> }
) {
  try {
    const email = await requireUserEmail();
    const { waybill } = await params;
    const shipment = await assertOwnShipment(waybill, email);

    const tracking = await trackShipment(waybill);
    await updateShipmentRecord(shipment.id, {
      trackingStatus: tracking.status,
      trackingData: tracking as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ tracking, shipment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Track failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ waybill: string }> }
) {
  try {
    const email = await requireUserEmail();
    const { waybill } = await params;
    const shipment = await assertOwnShipment(waybill, email);

    if (shipment.cancelledAt) {
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    }

    const result = await cancelShipment(waybill);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Cancellation failed" },
        { status: 502 }
      );
    }

    const updated = await updateShipmentRecord(shipment.id, {
      delhiveryStatus: "cancelled",
      cancelledAt: new Date().toISOString(),
    });

    return NextResponse.json({ shipment: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancel failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ waybill: string }> }
) {
  try {
    const email = await requireUserEmail();
    const { waybill } = await params;
    await assertOwnShipment(waybill, email);

    const label = await fetchPackingSlip(waybill);
    return NextResponse.json(label);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Label fetch failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
