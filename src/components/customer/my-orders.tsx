"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { CustomerOrder } from "@/lib/db/customer-orders";
import type { TrackingResult } from "@/types/shipment";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "delivered") return "bg-green-600";
  if (normalized === "cancelled") return "bg-red-600";
  if (normalized === "shipped") return "bg-blue-600";
  if (normalized === "confirmed") return "bg-emerald-600";
  return "bg-amber-500";
}

function formatCustomerOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    confirmed: "Order confirmed",
    pending: "Processing",
    shipped: "Ready to ship",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status.toLowerCase()] ?? status;
}

function formatCustomerShipmentStatus(status: string | null | undefined): string {
  if (!status) return "Preparing shipment";

  const labels: Record<string, string> = {
    manifested: "Ready to ship",
    manifest: "Ready to ship",
    created: "Ready to ship",
    success: "Ready to ship",
    shipped: "Ready to ship",
    "in transit": "On the way",
    in_transit: "On the way",
    dispatched: "On the way",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    rto: "Returned to sender",
    pending: "Processing",
  };

  return labels[status.toLowerCase()] ?? status;
}

export function MyOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, TrackingResult>>({});
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = (await res.json()) as { orders: CustomerOrder[] };
      setOrders(data.orders);
    } catch {
      toast.error("Could not load your orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const refreshTracking = async (waybill: string) => {
    setTrackingLoading(waybill);
    try {
      const res = await fetch(`/api/customer/shipments/${encodeURIComponent(waybill)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Track failed");
      setTracking((prev) => ({ ...prev, [waybill]: data.tracking }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tracking failed");
    } finally {
      setTrackingLoading(null);
    }
  };

  const cancelShipment = async (waybill: string) => {
    if (!confirm("Cancel this shipment? This cannot be undone.")) return;
    setActionLoading(waybill);
    try {
      const res = await fetch(
        `/api/customer/shipments/${encodeURIComponent(waybill)}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cancel failed");
      toast.success("Shipment cancellation requested");
      await loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-neutral-600">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 p-8 text-center text-neutral-600">
        <Package className="h-8 w-8 mx-auto mb-3 text-neutral-400" />
        <p>No orders yet. Your purchases will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const expanded = expandedId === order.id;
        const shipment = order.shipment;
        const waybill = shipment?.waybill;
        const track = waybill ? tracking[waybill] : undefined;

        return (
          <Card key={order.id} className="border-neutral-200 rounded-none">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm sm:text-base">{order.id}</span>
                    <Badge className={`rounded-none ${statusColor(order.status)}`}>
                      {formatCustomerOrderStatus(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600">{formatDate(order.createdAt)}</p>
                  <p className="text-sm mt-1">
                    {order.items.length} item(s) · ₹{order.total.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none w-full sm:w-auto"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" /> Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" /> Details
                    </>
                  )}
                </Button>
              </div>

              {expanded && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Items</p>
                    <ul className="text-sm space-y-1 text-neutral-700">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.productName} · {item.color} · {item.size} × {item.quantity}{" "}
                          — ₹{item.lineTotal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium mb-1">Ship to</p>
                    <p className="text-neutral-600">
                      {order.fullName}, {order.addressLine1}
                      {order.addressLine2 ? `, ${order.addressLine2}` : ""},{" "}
                      {order.city}, {order.state} {order.postalCode}
                    </p>
                  </div>

                  {shipment ? (
                    <div className="border border-neutral-200 p-4 space-y-3 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium text-sm">Shipment</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-neutral-500">AWB / Waybill:</span>{" "}
                          {shipment.waybill ?? "—"}
                        </p>
                        <p>
                          <span className="text-neutral-500">Status:</span>{" "}
                          {formatCustomerShipmentStatus(
                            shipment.trackingStatus ?? shipment.delhiveryStatus
                          )}
                        </p>
                        {shipment.cancelledAt && (
                          <p className="text-red-600">Cancelled</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {waybill && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-none"
                              disabled={trackingLoading === waybill}
                              onClick={() => refreshTracking(waybill)}
                            >
                              {trackingLoading === waybill ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-1" /> Track
                                </>
                              )}
                            </Button>
                            {!shipment.cancelledAt && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none text-red-700 border-red-200"
                                disabled={actionLoading === waybill}
                                onClick={() => cancelShipment(waybill)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      {track && track.scans.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium mb-2">Tracking updates</p>
                          <ul className="space-y-2 border-l-2 border-neutral-300 pl-3">
                            {track.scans.map((scan, i) => (
                              <li key={i}>
                                <p>{scan.status}</p>
                                {scan.location && (
                                  <p className="text-xs text-neutral-500">{scan.location}</p>
                                )}
                                {scan.timestamp && (
                                  <p className="text-xs text-neutral-400">{scan.timestamp}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      Shipment not created yet — we will notify you when it ships.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
