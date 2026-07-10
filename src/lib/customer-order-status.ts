import type { CustomerOrder } from "@/lib/db/customer-orders";
import type { TrackingResult } from "@/types/shipment";

export type CustomerOrderStatusKey =
  | "cancelled"
  | "delivered"
  | "in_transit"
  | "ready_to_ship"
  | "confirmed"
  | "pending"
  | "rto"
  | "unknown";

function normalizeStatus(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, " ");
}

function classifyShipmentStatus(status: string): CustomerOrderStatusKey | null {
  const normalized = normalizeStatus(status);

  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("rto") || normalized.includes("return")) return "rto";
  if (normalized.includes("deliver")) return "delivered";
  if (
    normalized.includes("transit") ||
    normalized.includes("dispatch") ||
    normalized.includes("ofd") ||
    normalized.includes("out for")
  ) {
    return "in_transit";
  }
  if (
    normalized.includes("manifest") ||
    normalized.includes("picked") ||
    normalized.includes("created") ||
    normalized.includes("success") ||
    normalized.includes("ship")
  ) {
    return "ready_to_ship";
  }
  if (normalized.includes("pending") || normalized.includes("process")) {
    return "pending";
  }

  return null;
}

export function getTrackingFromShipment(
  shipment: CustomerOrder["shipment"]
): TrackingResult | undefined {
  if (!shipment?.trackingData || typeof shipment.trackingData !== "object") {
    return undefined;
  }

  const data = shipment.trackingData as Partial<TrackingResult>;
  if (!data.status && !Array.isArray(data.scans)) {
    return undefined;
  }

  return {
    waybill: shipment.waybill ?? data.waybill ?? "",
    status: data.status ?? shipment.trackingStatus ?? shipment.delhiveryStatus ?? "Unknown",
    scans: Array.isArray(data.scans) ? data.scans : [],
    raw: data.raw,
  };
}

export function resolveCustomerOrderStatusKey(
  order: CustomerOrder,
  liveTracking?: TrackingResult
): CustomerOrderStatusKey {
  if (order.status.toLowerCase() === "cancelled" || order.shipment?.cancelledAt) {
    return "cancelled";
  }

  const candidates = [
    liveTracking?.status,
    order.shipment?.trackingStatus,
    order.shipment?.delhiveryStatus,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const classified = classifyShipmentStatus(candidate);
    if (classified) return classified;
  }

  const orderStatus = order.status.toLowerCase();
  if (orderStatus === "delivered") return "delivered";
  if (orderStatus === "shipped") return "ready_to_ship";
  if (orderStatus === "confirmed") return "confirmed";
  if (orderStatus === "pending") return "pending";
  if (orderStatus === "cancelled") return "cancelled";

  return order.shipment ? "ready_to_ship" : "confirmed";
}

export function formatCustomerOrderStatusLabel(key: CustomerOrderStatusKey): string {
  const labels: Record<CustomerOrderStatusKey, string> = {
    cancelled: "Cancelled",
    delivered: "Delivered",
    in_transit: "On the way",
    ready_to_ship: "Ready to ship",
    confirmed: "Order confirmed",
    pending: "Processing",
    rto: "Returned to sender",
    unknown: "Processing",
  };
  return labels[key];
}

export function customerOrderStatusColor(key: CustomerOrderStatusKey): string {
  switch (key) {
    case "delivered":
      return "bg-green-600";
    case "cancelled":
    case "rto":
      return "bg-red-600";
    case "in_transit":
      return "bg-blue-600";
    case "ready_to_ship":
      return "bg-indigo-600";
    case "confirmed":
      return "bg-emerald-600";
    default:
      return "bg-amber-500";
  }
}

export function formatCustomerShipmentStatus(
  order: CustomerOrder,
  liveTracking?: TrackingResult
): string {
  return formatCustomerOrderStatusLabel(
    resolveCustomerOrderStatusKey(order, liveTracking)
  );
}
