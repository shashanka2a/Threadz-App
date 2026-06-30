import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { OrderItemRow, OrderRow } from "@/lib/supabase/database.types";
import type { ShipmentRecord } from "@/types/shipment";
import { getShipmentsByOrderIds } from "@/lib/db/shipments";

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrder = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
  items: AdminOrderItem[];
  shipment: ShipmentRecord | null;
};

function mapOrderRow(
  row: OrderRow,
  items: OrderItemRow[],
  shipment: ShipmentRecord | null
): AdminOrder {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    shippingCost: Number(row.shipping_cost ?? 0),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
    shipment,
  };
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const supabase = createAdminClient();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError || !orders?.length) {
    if (ordersError) {
      console.warn("[getAdminOrders]", ordersError.message);
    }
    return [];
  }

  const orderIds = orders.map((order) => order.id);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

    if (itemsError) {
    console.warn("[getAdminOrders] items:", itemsError.message);
    const shipmentsByOrder = await getShipmentsByOrderIds(orderIds);
    return orders.map((order) =>
      mapOrderRow(order, [], shipmentsByOrder[order.id] ?? null)
    );
  }

  const itemsByOrder = (items ?? []).reduce<Record<string, OrderItemRow[]>>((acc, item) => {
    if (!acc[item.order_id]) acc[item.order_id] = [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  const shipmentsByOrder = await getShipmentsByOrderIds(orderIds);

  return orders.map((order) =>
    mapOrderRow(order, itemsByOrder[order.id] ?? [], shipmentsByOrder[order.id] ?? null)
  );
}
