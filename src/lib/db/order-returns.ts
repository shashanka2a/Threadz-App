import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requestDelhiveryPickup } from "@/lib/delhivery";
import type { ProductUpdate } from "@/lib/supabase/database.types";

export type RequestReturnOptions = {
  isCustomer?: boolean;
  userEmail?: string;
  reason?: string;
};

export type ReturnOperationResult =
  | { ok: true; message: string; [key: string]: unknown }
  | { ok: false; error: string };

export async function requestOrderReturn(
  orderId: string,
  options: RequestReturnOptions = {}
): Promise<ReturnOperationResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Order not found" };
  }

  if (order.status.toLowerCase() === "cancelled") {
    return { ok: false, error: "Cancelled orders cannot be returned" };
  }

  if (options.isCustomer) {
    if (!options.userEmail || order.email.toLowerCase() !== options.userEmail.toLowerCase()) {
      return { ok: false, error: "You are not authorized to return this order" };
    }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "return_requested",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    // If the database has a check constraint that only allows certain statuses,
    // fallback to updating status with metadata note or 'pending'
    return { ok: false, error: `Failed to request return: ${updateError.message}` };
  }

  return {
    ok: true,
    message: `Return request submitted for Order #${orderId}. Our team will review and schedule a Delhivery reverse pickup.`,
  };
}

export async function scheduleDelhiveryReturnPickup(
  orderId: string,
  pickupParams: {
    pickupDate?: string;
    pickupTime?: string;
    expectedPackageCount?: number;
  } = {}
): Promise<ReturnOperationResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Order not found" };
  }

  const pickupResult = await requestDelhiveryPickup({
    orderId: order.id,
    customerName: order.full_name,
    phone: order.phone,
    address: [order.address_line1, order.address_line2].filter(Boolean).join(", "),
    city: order.city,
    state: order.state,
    pincode: order.postal_code,
    pickupDate: pickupParams.pickupDate,
    pickupTime: pickupParams.pickupTime,
    expectedPackageCount: pickupParams.expectedPackageCount ?? 1,
  });

  if (!pickupResult.success) {
    return {
      ok: false,
      error: pickupResult.error ?? "Failed to schedule Delhivery pickup",
    };
  }

  // Update shipment status if shipment exists
  await supabase
    .from("shipments")
    .update({
      delhivery_status: "Return Pickup Scheduled",
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  return {
    ok: true,
    pickupId: pickupResult.pickupId,
    waybill: pickupResult.waybill,
    message: pickupResult.message ?? `Delhivery pickup scheduled successfully (Pickup ID: ${pickupResult.pickupId}).`,
  };
}

export async function completeReturnAndRestock(
  orderId: string
): Promise<ReturnOperationResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Order not found" };
  }

  // Fetch line items to restock
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    return { ok: false, error: `Failed to load order items: ${itemsError.message}` };
  }

  // Restock inventory
  let restockedUnits = 0;
  if (items && items.length > 0) {
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("id, size_s, size_m, size_l, size_xl, quantity")
        .eq("id", item.product_id)
        .maybeSingle();

      if (product) {
        const size = (item.size || "").toUpperCase();
        const patch: ProductUpdate = {
          quantity: product.quantity + item.quantity,
          updated_at: new Date().toISOString(),
        };

        if (size === "S") patch.size_s = product.size_s + item.quantity;
        else if (size === "M") patch.size_m = product.size_m + item.quantity;
        else if (size === "L") patch.size_l = product.size_l + item.quantity;
        else if (size === "XL") patch.size_xl = product.size_xl + item.quantity;

        await supabase.from("products").update(patch).eq("id", product.id);
        restockedUnits += item.quantity;
      }
    }
  }

  // Update order status
  await supabase
    .from("orders")
    .update({ status: "returned", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  return {
    ok: true,
    message: `Return for Order #${orderId} marked as completed and ${restockedUnits} item(s) restocked to inventory.`,
  };
}
