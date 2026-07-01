import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createShipment,
  estimateOrderWeightGrams,
  estimateShippingCost,
  fetchPackingSlip,
  updateShipment as delhiveryUpdateShipment,
} from "@/lib/delhivery";
import {
  getShipmentByOrderId,
  insertShipment,
  updateOrderShippingCost,
  updateShipmentRecord,
} from "@/lib/db/shipments";

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as { orderId?: string; weightGrams?: number };
    const orderId = body.orderId?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const existing = await getShipmentByOrderId(orderId);
    if (existing?.waybill && !existing.cancelledAt) {
      return NextResponse.json(
        { error: "Shipment already exists for this order", shipment: existing },
        { status: 409 }
      );
    }

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    const itemCount = (items ?? []).reduce((sum, i) => sum + i.quantity, 0);
    const weightGrams = body.weightGrams ?? estimateOrderWeightGrams(itemCount);
    const paymentMode =
      order.payment_method.toLowerCase() === "cod" ? "COD" : "Prepaid";

    const address = [order.address_line1, order.address_line2]
      .filter(Boolean)
      .join(", ");

    const productDescription = (items ?? [])
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join(", ")
      .slice(0, 200);

    const estimate = await estimateShippingCost({
      destinationPin: order.postal_code,
      weightGrams,
      paymentMode,
    });

    const created = await createShipment({
      orderId: order.id,
      name: order.full_name,
      phone: order.phone,
      address,
      city: order.city,
      state: order.state,
      pincode: order.postal_code,
      email: order.email,
      totalAmount: Number(order.total),
      weightGrams,
      paymentMode,
      productDescription: productDescription || "Apparel",
      quantity: itemCount,
    });

    if (!created.success || !created.waybill) {
      const isBalanceError = /insufficient balance/i.test(created.error ?? "");
      return NextResponse.json(
        {
          error: created.error ?? "Delhivery create failed",
          code: isBalanceError ? "DELHIVERY_INSUFFICIENT_BALANCE" : "DELHIVERY_CREATE_FAILED",
          raw: created.raw,
        },
        { status: isBalanceError ? 402 : 502 }
      );
    }

    const label = await fetchPackingSlip(created.waybill);

    const shipment = await insertShipment({
      orderId,
      waybill: created.waybill,
      delhiveryStatus: created.status ?? "created",
      paymentMode,
      shippingCost: estimate.estimatedCost,
      weightGrams,
      labelData: label.raw as Record<string, unknown> | undefined,
      pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION ?? "kandukya",
    });

    await updateOrderShippingCost(orderId, estimate.estimatedCost, "shipped");

    return NextResponse.json({
      shipment,
      labelUrl: label.labelUrl,
      estimate,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create shipment failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as {
      shipmentId?: string;
      name?: string;
      phone?: string;
      address?: string;
      pincode?: string;
      weightGrams?: number;
    };

    if (!body.shipmentId) {
      return NextResponse.json({ error: "shipmentId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", body.shipmentId)
      .single();

    if (!row?.waybill) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const result = await delhiveryUpdateShipment({
      waybill: row.waybill,
      name: body.name,
      phone: body.phone,
      address: body.address,
      pincode: body.pincode,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Update failed" },
        { status: 502 }
      );
    }

    const shipment = await updateShipmentRecord(body.shipmentId, {
      weightGrams: body.weightGrams,
      delhiveryStatus: "updated",
    });

    return NextResponse.json({ shipment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update shipment failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
