"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Loader2,
  PackagePlus,
  RefreshCw,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminOrder } from "@/lib/db/admin-orders";
import type { ShipmentRecord } from "@/types/shipment";
import type { TrackingResult } from "@/types/shipment";

type ShipmentPanelProps = {
  order: AdminOrder;
  shipment: ShipmentRecord | null;
  onUpdated: () => void;
};

export function ShipmentPanel({ order, shipment, onUpdated }: ShipmentPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingResult | null>(null);

  const createShipment = async () => {
    setLoading("create");
    try {
      const res = await fetch("/api/admin/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      toast.success(`Shipment created — AWB ${data.shipment?.waybill ?? ""}`);
      if (data.labelUrl) window.open(data.labelUrl, "_blank", "noopener,noreferrer");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create shipment failed");
    } finally {
      setLoading(null);
    }
  };

  const refreshTracking = async () => {
    if (!shipment) return;
    setLoading("track");
    try {
      const res = await fetch(
        `/api/admin/shipments/${shipment.id}?action=track`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Track failed");
      setTracking(data.tracking);
      toast.success("Tracking refreshed");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Track failed");
    } finally {
      setLoading(null);
    }
  };

  const fetchLabel = async () => {
    if (!shipment) return;
    setLoading("label");
    try {
      const res = await fetch(
        `/api/admin/shipments/${shipment.id}?action=label`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Label failed");
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.message("Label not available yet");
      }
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Label failed");
    } finally {
      setLoading(null);
    }
  };

  const cancelShipment = async () => {
    if (!shipment) return;
    if (!confirm("Cancel Delhivery shipment for this order?")) return;
    setLoading("cancel");
    try {
      const res = await fetch(`/api/admin/shipments/${shipment.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cancel failed");
      toast.success("Shipment cancelled");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border border-neutral-300 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <p className="font-medium text-sm">Delhivery shipment</p>
        </div>
        {!shipment?.waybill && (
          <Button
            size="sm"
            className="rounded-none bg-black text-white hover:bg-neutral-800"
            disabled={loading === "create" || order.status === "cancelled"}
            onClick={createShipment}
          >
            {loading === "create" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <PackagePlus className="h-4 w-4 mr-1" /> Create shipment
              </>
            )}
          </Button>
        )}
      </div>

      {shipment?.waybill ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-neutral-500 block text-xs">Waybill</span>
              <span className="font-mono">{shipment.waybill}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-xs">Delhivery status</span>
              <Badge variant="outline" className="rounded-none text-xs">
                {shipment.delhiveryStatus}
              </Badge>
            </div>
            <div>
              <span className="text-neutral-500 block text-xs">Tracking</span>
              {shipment.trackingStatus ?? "—"}
            </div>
            <div>
              <span className="text-neutral-500 block text-xs">Shipping cost</span>
              {shipment.shippingCost != null ? `₹${shipment.shippingCost}` : "—"}
            </div>
            <div>
              <span className="text-neutral-500 block text-xs">Weight</span>
              {shipment.weightGrams}g
            </div>
            <div>
              <span className="text-neutral-500 block text-xs">Payment mode</span>
              {shipment.paymentMode}
            </div>
            {shipment.cancelledAt && (
              <div className="text-red-600 text-sm">Cancelled</div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={!!loading}
              onClick={refreshTracking}
            >
              {loading === "track" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh tracking
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={!!loading}
              onClick={fetchLabel}
            >
              {loading === "label" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-1" /> Download label
                </>
              )}
            </Button>
            {!shipment.cancelledAt && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-none text-red-700 border-red-200"
                disabled={!!loading}
                onClick={cancelShipment}
              >
                {loading === "cancel" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" /> Cancel shipment
                  </>
                )}
              </Button>
            )}
          </div>

          {(tracking?.scans?.length ?? shipment.trackingData) && (
            <div className="text-sm border-t border-neutral-200 pt-3">
              <p className="font-medium mb-2">Latest scans</p>
              <ul className="space-y-1 text-neutral-700">
                {(tracking?.scans ??
                  (Array.isArray(
                    (shipment.trackingData as { scans?: unknown })?.scans
                  )
                    ? ((shipment.trackingData as { scans: TrackingResult["scans"] })
                        .scans ?? [])
                    : [])).map((scan, i) => (
                  <li key={i} className="text-xs">
                    {scan.status}
                    {scan.location ? ` · ${scan.location}` : ""}
                    {scan.timestamp ? ` · ${scan.timestamp}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-neutral-600">
          No shipment yet. Create a Delhivery pickup after payment is confirmed.
        </p>
      )}
    </div>
  );
}
