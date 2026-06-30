import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { ShipmentRecord } from "@/types/shipment";

type ShipmentUpdate = Database["public"]["Tables"]["shipments"]["Update"];

type ShipmentRow = {
  id: string;
  order_id: string;
  waybill: string | null;
  delhivery_status: string;
  payment_mode: string;
  shipping_cost: number | null;
  weight_grams: number;
  label_data: Record<string, unknown> | null;
  tracking_status: string | null;
  tracking_data: Record<string, unknown> | null;
  pickup_location: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapShipment(row: ShipmentRow): ShipmentRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    waybill: row.waybill,
    delhiveryStatus: row.delhivery_status,
    paymentMode: row.payment_mode,
    shippingCost: row.shipping_cost != null ? Number(row.shipping_cost) : null,
    weightGrams: row.weight_grams,
    labelData: row.label_data,
    trackingStatus: row.tracking_status,
    trackingData: row.tracking_data,
    pickupLocation: row.pickup_location,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getShipmentByOrderId(
  orderId: string
): Promise<ShipmentRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return mapShipment(data as ShipmentRow);
}

export async function getShipmentsByOrderIds(
  orderIds: string[]
): Promise<Record<string, ShipmentRecord>> {
  if (!orderIds.length) return {};

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .in("order_id", orderIds);

  if (error || !data?.length) return {};

  return (data as ShipmentRow[]).reduce<Record<string, ShipmentRecord>>(
    (acc, row) => {
      acc[row.order_id] = mapShipment(row);
      return acc;
    },
    {}
  );
}

export async function getShipmentById(id: string): Promise<ShipmentRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapShipment(data as ShipmentRow);
}

export async function getShipmentByWaybill(
  waybill: string
): Promise<ShipmentRecord | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("waybill", waybill)
    .maybeSingle();

  if (error || !data) return null;
  return mapShipment(data as ShipmentRow);
}

export type InsertShipmentInput = {
  orderId: string;
  waybill: string;
  delhiveryStatus?: string;
  paymentMode: string;
  shippingCost?: number;
  weightGrams: number;
  labelData?: Record<string, unknown>;
  pickupLocation?: string;
};

export async function insertShipment(
  input: InsertShipmentInput
): Promise<ShipmentRecord> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .insert({
      order_id: input.orderId,
      waybill: input.waybill,
      delhivery_status: input.delhiveryStatus ?? "created",
      payment_mode: input.paymentMode,
      shipping_cost: input.shippingCost ?? null,
      weight_grams: input.weightGrams,
      label_data: input.labelData ?? null,
      pickup_location: input.pickupLocation ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save shipment");
  }

  return mapShipment(data as ShipmentRow);
}

export async function updateShipmentRecord(
  id: string,
  patch: Partial<{
    delhiveryStatus: string;
    shippingCost: number;
    weightGrams: number;
    labelData: Record<string, unknown>;
    trackingStatus: string;
    trackingData: Record<string, unknown>;
    cancelledAt: string | null;
  }>
): Promise<ShipmentRecord> {
  const supabase = createAdminClient();
  const update: ShipmentUpdate = {};
  if (patch.delhiveryStatus != null) update.delhivery_status = patch.delhiveryStatus;
  if (patch.shippingCost != null) update.shipping_cost = patch.shippingCost;
  if (patch.weightGrams != null) update.weight_grams = patch.weightGrams;
  if (patch.labelData != null) update.label_data = patch.labelData;
  if (patch.trackingStatus != null) update.tracking_status = patch.trackingStatus;
  if (patch.trackingData != null) update.tracking_data = patch.trackingData;
  if (patch.cancelledAt !== undefined) update.cancelled_at = patch.cancelledAt;

  const { data, error } = await supabase
    .from("shipments")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update shipment");
  }

  return mapShipment(data as ShipmentRow);
}

export async function updateOrderShippingCost(
  orderId: string,
  shippingCost: number,
  status?: string
): Promise<void> {
  const supabase = createAdminClient();
  const patch: Database["public"]["Tables"]["orders"]["Update"] = {
    shipping_cost: shippingCost,
  };
  if (status) patch.status = status;

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) throw new Error(error.message);
}
