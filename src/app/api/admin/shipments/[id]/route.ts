import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cancelShipment,
  fetchPackingSlip,
  trackShipment,
} from "@/lib/delhivery";
import { updateShipmentRecord } from "@/lib/db/shipments";

async function loadShipment(id: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("shipments").select("*").eq("id", id).single();
  return data;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const action = new URL(request.url).searchParams.get("action");
    const row = await loadShipment(id);

    if (!row?.waybill) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    if (action === "label") {
      const label = await fetchPackingSlip(row.waybill);
      if (label.labelUrl) {
        await updateShipmentRecord(id, {
          labelData: label.raw as Record<string, unknown>,
        });
      }
      return NextResponse.json(label);
    }

    const tracking = await trackShipment(row.waybill);
    await updateShipmentRecord(id, {
      trackingStatus: tracking.status,
      trackingData: tracking as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ tracking, shipment: row });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shipment action failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const row = await loadShipment(id);

    if (!row?.waybill) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    if (row.cancelled_at) {
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    }

    const result = await cancelShipment(row.waybill);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Cancellation failed" },
        { status: 502 }
      );
    }

    const shipment = await updateShipmentRecord(id, {
      delhiveryStatus: "cancelled",
      cancelledAt: new Date().toISOString(),
    });

    const supabase = createAdminClient();
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", row.order_id);

    return NextResponse.json({ shipment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancel failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
