import { createClient } from "@/lib/supabase/server";
import type { OrderItemRow } from "@/lib/supabase/database.types";
import type { ShipmentRecord } from "@/types/shipment";

export type CustomerOrderItem = {
  id: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CustomerOrder = {
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
  items: CustomerOrderItem[];
  shipment: ShipmentRecord | null;
};

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return [];

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError || !orders?.length) return [];

  const orderIds = orders.map((o) => o.id);

  const [{ data: items }, { data: shipments }] = await Promise.all([
    supabase.from("order_items").select("*").in("order_id", orderIds),
    supabase.from("shipments").select("*").in("order_id", orderIds),
  ]);

  const itemsByOrder = (items ?? []).reduce<Record<string, OrderItemRow[]>>(
    (acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    },
    {}
  );

  type ShipmentRow = NonNullable<typeof shipments>[number];
  const shipmentByOrder = (shipments ?? []).reduce<Record<string, ShipmentRow>>(
    (acc, row) => {
      acc[row.order_id] = row;
      return acc;
    },
    {}
  );

  return orders.map((order) => {
    const shipmentRow = shipmentByOrder[order.id];
    const shipment: ShipmentRecord | null = shipmentRow
      ? {
          id: shipmentRow.id,
          orderId: shipmentRow.order_id,
          waybill: shipmentRow.waybill,
          delhiveryStatus: shipmentRow.delhivery_status,
          paymentMode: shipmentRow.payment_mode,
          shippingCost:
            shipmentRow.shipping_cost != null
              ? Number(shipmentRow.shipping_cost)
              : null,
          weightGrams: shipmentRow.weight_grams,
          labelData: shipmentRow.label_data as Record<string, unknown> | null,
          trackingStatus: shipmentRow.tracking_status,
          trackingData: shipmentRow.tracking_data as Record<string, unknown> | null,
          pickupLocation: shipmentRow.pickup_location,
          cancelledAt: shipmentRow.cancelled_at,
          createdAt: shipmentRow.created_at,
          updatedAt: shipmentRow.updated_at,
        }
      : null;

    return {
      id: order.id,
      fullName: order.full_name,
      phone: order.phone,
      email: order.email,
      addressLine1: order.address_line1,
      addressLine2: order.address_line2,
      city: order.city,
      state: order.state,
      postalCode: order.postal_code,
      country: order.country,
      paymentMethod: order.payment_method,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shipping_cost ?? 0),
      total: Number(order.total),
      status: order.status,
      createdAt: order.created_at,
      items: (itemsByOrder[order.id] ?? []).map((item) => ({
        id: item.id,
        productName: item.product_name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        lineTotal: Number(item.line_total),
      })),
      shipment,
    };
  });
}
