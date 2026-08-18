import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getOrderCancellationEligibility } from "@/lib/order-eligibility";
import type { ProductUpdate } from "@/lib/supabase/database.types";

export type CancelOrderOptions = {
  isCustomer?: boolean;
  userEmail?: string;
};

export type CancelOrderResult =
  | { ok: true; message: string; restockedItemsCount: number }
  | { ok: false; error: string };

export async function cancelOrder(
  orderId: string,
  options: CancelOrderOptions = {}
): Promise<CancelOrderResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const supabase = createAdminClient();

  // 1. Fetch order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Order not found" };
  }

  // 2. Check if already cancelled
  if (order.status.toLowerCase() === "cancelled") {
    return { ok: false, error: "This order has already been cancelled" };
  }

  // 3. Customer validation
  if (options.isCustomer) {
    if (!options.userEmail || order.email.toLowerCase() !== options.userEmail.toLowerCase()) {
      return { ok: false, error: "You are not authorized to cancel this order" };
    }

    const eligibility = getOrderCancellationEligibility(order.created_at, order.status);
    if (!eligibility.eligible) {
      return { ok: false, error: eligibility.reason ?? "Order cannot be cancelled" };
    }
  }

  // 4. Fetch line items to restock
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    return { ok: false, error: `Failed to load order items: ${itemsError.message}` };
  }

  // 5. Update order status to 'cancelled'
  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateOrderError) {
    return { ok: false, error: `Failed to cancel order: ${updateOrderError.message}` };
  }

  // 6. Restock inventory for each product
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

  // 7. Update shipment if present
  await supabase
    .from("shipments")
    .update({
      cancelled_at: new Date().toISOString(),
      delhivery_status: "Cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .is("cancelled_at", null);

  return {
    ok: true,
    message: `Order #${orderId} was successfully cancelled and ${restockedUnits} item(s) were restored to inventory.`,
    restockedItemsCount: restockedUnits,
  };
}
