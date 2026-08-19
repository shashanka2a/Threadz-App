"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  XCircle,
  AlertTriangle,
  Undo2,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import type { CustomerOrder } from "@/lib/db/customer-orders";
import {
  customerOrderStatusColor,
  formatCustomerOrderStatusLabel,
  formatCustomerShipmentStatus,
  getTrackingFromShipment,
  resolveCustomerOrderStatusKey,
} from "@/lib/customer-order-status";
import { getOrderCancellationEligibility } from "@/lib/order-eligibility";
import { getOrderRefundInfo } from "@/lib/razorpay-refund";
import type { TrackingResult } from "@/types/shipment";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MyOrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading orders">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="flex gap-4 items-center">
            <Skeleton className="w-16 h-16 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyOrders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, TrackingResult>>({});
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("Size does not fit");
  const [returnComments, setReturnComments] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

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

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const res = await fetch(
        `/api/customer/orders/${encodeURIComponent(orderId)}/cancel`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to cancel order");
      }
      toast.success(data.message ?? `Order #${orderId} was cancelled successfully`);
      await loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    setSubmittingReturn(true);
    try {
      const res = await fetch(
        `/api/customer/orders/${encodeURIComponent(orderId)}/return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: `${returnReason}${returnComments ? ` - ${returnComments}` : ""}`,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to request return");
      }
      toast.success(data.message ?? "Return request submitted successfully");
      setReturnDialogOpen(null);
      setReturnComments("");
      await loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request return");
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return <MyOrdersSkeleton />;
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
        const cachedTracking = waybill ? tracking[waybill] : undefined;
        const storedTracking = getTrackingFromShipment(shipment);
        const liveTracking = cachedTracking ?? storedTracking;
        const statusKey = resolveCustomerOrderStatusKey(order, liveTracking);
        const statusLabel = formatCustomerOrderStatusLabel(statusKey);
        const track = cachedTracking ?? storedTracking;

        const isCancelled = order.status.toLowerCase() === "cancelled" || statusKey === "cancelled";
        const isReturnRequested = order.status.toLowerCase() === "return_requested" || statusKey === "return_requested";
        const isReturned = order.status.toLowerCase() === "returned" || statusKey === "returned";
        const isDelivered = order.status.toLowerCase() === "delivered" || statusKey === "delivered";

        const eligibility = getOrderCancellationEligibility(order.createdAt, order.status);
        const refundInfo = getOrderRefundInfo(order);
        const isPrepaid = order.paymentMethod.toLowerCase() !== "cod";

        // Cancel is strictly available ONLY within 24 hours and BEFORE delivery
        const canCancel = eligibility.eligible && !isCancelled && !isDelivered && !isReturnRequested && !isReturned;

        // Return is strictly available ONLY AFTER order delivery
        const canRequestReturn = isDelivered && !isCancelled && !isReturnRequested && !isReturned;

        return (
          <Card
            key={order.id}
            className={`rounded-none transition-all ${
              isCancelled ? "border-neutral-200 bg-neutral-50/50 opacity-90" : "border-neutral-200 bg-card"
            }`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium text-sm sm:text-base">{order.id}</span>
                    <Badge className={`rounded-none ${customerOrderStatusColor(statusKey)}`}>
                      {statusLabel}
                    </Badge>
                    {isCancelled ? (
                      refundInfo ? (
                        <Badge variant="outline" className="rounded-none text-xs border-emerald-300 text-emerald-800 bg-emerald-50 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Refund Processed (₹{refundInfo.amount.toLocaleString()})
                        </Badge>
                      ) : isPrepaid ? (
                        <Badge variant="outline" className="rounded-none text-xs border-amber-300 text-amber-800 bg-amber-50 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-600" />
                          Refund in 3 business days
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-none text-xs border-neutral-200 text-neutral-600 bg-neutral-50">
                          COD · No Payment Charged
                        </Badge>
                      )
                    ) : isReturnRequested ? (
                      <Badge variant="outline" className="rounded-none text-xs border-purple-300 text-purple-800 bg-purple-50 flex items-center gap-1">
                        <Truck className="h-3 w-3 text-purple-600" />
                        Delhivery Pickup Pending
                      </Badge>
                    ) : isReturned ? (
                      refundInfo ? (
                        <Badge variant="outline" className="rounded-none text-xs border-emerald-300 text-emerald-800 bg-emerald-50 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Refund Processed (₹{refundInfo.amount.toLocaleString()})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-none text-xs border-blue-300 text-blue-800 bg-blue-50 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-blue-600" />
                          Return Completed
                        </Badge>
                      )
                    ) : isDelivered ? (
                      <Badge variant="outline" className="rounded-none text-xs border-green-300 text-green-800 bg-green-50 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Delivered · Return Eligible
                      </Badge>
                    ) : canCancel ? (
                      <Badge variant="outline" className="rounded-none text-xs border-amber-300 text-amber-800 bg-amber-50 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Cancel available ({eligibility.hoursRemaining}h {eligibility.minutesRemaining}m left)
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-neutral-400">
                        24h cancellation window passed
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500">{formatDate(order.createdAt)}</p>
                  <p className="text-sm font-medium pt-0.5">
                    {order.items.length} item(s) · ₹{order.total.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs sm:text-sm"
                          disabled={cancellingOrderId === order.id}
                        >
                          {cancellingOrderId === order.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Cancel Order
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-serif text-xl">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            Cancel Order #{order.id}?
                          </AlertDialogTitle>
                          <div className="space-y-3 text-sm text-neutral-600 pt-2">
                            <p>
                              Are you sure you want to cancel this order? This action cannot be undone.
                            </p>

                            {/* Order Details Breakdown */}
                            <div className="bg-neutral-50 p-3 border border-neutral-200 rounded-none text-xs space-y-2 text-neutral-800">
                              <p className="font-semibold text-neutral-900 border-b border-neutral-200 pb-1">
                                Order Details ({order.items.length} item{order.items.length > 1 ? "s" : ""})
                              </p>
                              <ul className="space-y-1.5">
                                {order.items.map((it) => (
                                  <li key={it.id} className="flex justify-between items-center">
                                    <span className="text-neutral-700">
                                      {it.productName} · <span className="font-medium">{it.color}</span> · <span className="font-mono">{it.size}</span> × {it.quantity}
                                    </span>
                                    <span className="font-medium tabular-nums text-neutral-900">
                                      ₹{it.lineTotal.toLocaleString()}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <div className="flex justify-between items-center border-t border-neutral-200 pt-1.5 font-semibold text-neutral-900">
                                <span>Order Total:</span>
                                <span className="tabular-nums">₹{order.total.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Refund Info */}
                            <div className="bg-amber-50/80 p-3 border border-amber-200 rounded-none text-xs text-amber-950 space-y-1">
                              <p className="font-semibold flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                                Payment Refund Timeline
                              </p>
                              <p className="text-amber-900 leading-relaxed">
                                If paid online via UPI/Card, your full refund of <strong>₹{order.total.toLocaleString()}</strong> will be credited to your original payment source within <strong>3 business days</strong>.
                              </p>
                            </div>
                          </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-0 mt-3">
                          <AlertDialogCancel className="rounded-none">Keep Order</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-none bg-red-600 text-white hover:bg-red-700"
                          >
                            Confirm Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {canRequestReturn && (
                    <Dialog
                      open={returnDialogOpen === order.id}
                      onOpenChange={(isOpen) => setReturnDialogOpen(isOpen ? order.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-purple-300 text-purple-800 hover:bg-purple-50 text-xs sm:text-sm gap-1.5"
                        >
                          <Undo2 className="h-3.5 w-3.5 text-purple-600" />
                          Request Return
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-none max-w-md">
                        <DialogHeader>
                          <div className="flex items-center gap-2 text-purple-800 font-serif text-xl">
                            <Undo2 className="h-5 w-5 shrink-0 text-purple-600" />
                            <DialogTitle className="font-serif">Request Order Return</DialogTitle>
                          </div>
                          <DialogDescription className="text-xs text-neutral-600 pt-1">
                            We will schedule a Delhivery reverse pickup at your shipping address and process your refund upon collection.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-3 text-sm">
                          <div className="bg-neutral-50 p-3 border border-neutral-200 rounded-none text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Order ID:</span>
                              <span className="font-mono font-medium">{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Items:</span>
                              <span>{order.items.length} item(s)</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="return-reason" className="text-xs font-medium">
                              Reason for Return <span className="text-red-500">*</span>
                            </Label>
                            <Select value={returnReason} onValueChange={setReturnReason}>
                              <SelectTrigger id="return-reason" className="rounded-none text-xs">
                                <SelectValue placeholder="Select Reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Size does not fit">Size issue (Too large / Too small)</SelectItem>
                                <SelectItem value="Defective or damaged item">Defective or damaged item</SelectItem>
                                <SelectItem value="Item different from description">Item different from description</SelectItem>
                                <SelectItem value="Quality not as expected">Quality not as expected</SelectItem>
                                <SelectItem value="Changed my mind">Changed mind</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="return-notes" className="text-xs font-medium">
                              Additional Comments (Optional)
                            </Label>
                            <Input
                              id="return-notes"
                              placeholder="Describe any issues..."
                              value={returnComments}
                              onChange={(e) => setReturnComments(e.target.value)}
                              className="rounded-none text-xs"
                            />
                          </div>

                          <div className="p-2.5 bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
                            <Truck className="h-4 w-4 shrink-0 text-purple-600 mt-0.5" />
                            <span>
                              Our courier partner Delhivery will pick up the package from {order.addressLine1}, {order.city}.
                            </span>
                          </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            variant="outline"
                            className="rounded-none"
                            onClick={() => setReturnDialogOpen(null)}
                            disabled={submittingReturn}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="rounded-none bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                            onClick={() => handleRequestReturn(order.id)}
                            disabled={submittingReturn}
                          >
                            {submittingReturn ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Undo2 className="h-4 w-4" />
                                Submit Return Request
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none w-full sm:w-auto"
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" /> View Details
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
                  {isCancelled && (
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                        <div>
                          <p className="font-semibold">Order Cancelled</p>
                          <p className="text-red-700">This order has been cancelled.</p>
                        </div>
                      </div>

                      {refundInfo ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm space-y-1.5">
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Payment Refund Processed Successfully
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-emerald-800">
                            <div>
                              <span className="text-emerald-600">Refund Amount:</span>{" "}
                              <span className="font-semibold text-emerald-950 font-mono">₹{refundInfo.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-emerald-600">Refund ID:</span>{" "}
                              <span className="font-mono font-medium text-emerald-950">{refundInfo.refundId}</span>
                            </div>
                            <div>
                              <span className="text-emerald-600">Status:</span>{" "}
                              <span className="uppercase font-semibold text-emerald-900">{refundInfo.status}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-700 pt-0.5">
                            Credited to your original payment method.
                          </p>
                        </div>
                      ) : isPrepaid ? (
                        <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                            <Clock className="h-4 w-4 text-amber-700" />
                            Payment Refund in Progress
                          </div>
                          <p className="text-amber-800 text-xs leading-relaxed">
                            Your refund of <strong>₹{order.total.toLocaleString()}</strong> has been initiated and will be credited to your original payment method within <strong>3 business days</strong>.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {isReturnRequested && (
                    <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs sm:text-sm flex items-start gap-2">
                      <Truck className="h-4 w-4 mt-0.5 shrink-0 text-purple-600" />
                      <div>
                        <p className="font-semibold">Return Requested &amp; Pickup in Progress</p>
                        <p className="text-purple-700">We have registered your return request. A Delhivery courier partner will arrive to collect the package.</p>
                      </div>
                    </div>
                  )}

                  {isReturned && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                        <div>
                          <p className="font-semibold">Return Completed</p>
                          <p className="text-blue-700">The returned items have been received and inspected.</p>
                        </div>
                      </div>

                      {refundInfo ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm space-y-1.5">
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Return Refund Processed Successfully
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-emerald-800">
                            <div>
                              <span className="text-emerald-600">Refund Amount:</span>{" "}
                              <span className="font-semibold text-emerald-950 font-mono">₹{refundInfo.amount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-emerald-600">Refund ID:</span>{" "}
                              <span className="font-mono font-medium text-emerald-950">{refundInfo.refundId}</span>
                            </div>
                            <div>
                              <span className="text-emerald-600">Status:</span>{" "}
                              <span className="uppercase font-semibold text-emerald-900">{refundInfo.status}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-emerald-700 pt-0.5">
                            Credited to your original payment method.
                          </p>
                        </div>
                      ) : isPrepaid ? (
                        <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                            <Clock className="h-4 w-4 text-amber-700" />
                            Return Refund in Progress
                          </div>
                          <p className="text-amber-800 text-xs leading-relaxed">
                            Your refund of <strong>₹{order.total.toLocaleString()}</strong> will be credited to your original payment method within <strong>3 business days</strong>.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Order Items</p>
                    <ul className="text-sm space-y-1 text-neutral-700">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between items-center py-1 border-b border-neutral-100 last:border-0">
                          <span>
                            {item.productName} · <span className="font-medium">{item.color}</span> · <span className="font-mono">{item.size}</span> × {item.quantity}
                          </span>
                          <span className="font-medium tabular-nums">₹{item.lineTotal.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium mb-1">Shipping Address</p>
                    <p className="text-neutral-600 leading-relaxed">
                      {order.fullName}, {order.addressLine1}
                      {order.addressLine2 ? `, ${order.addressLine2}` : ""},{" "}
                      {order.city}, {order.state} {order.postalCode}
                    </p>
                    {order.phone && (
                      <p className="text-neutral-600 mt-1 flex items-center gap-1.5 text-xs sm:text-sm">
                        <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <span className="text-neutral-500">Phone:</span>
                        <span className="font-mono font-medium text-neutral-900">{order.phone}</span>
                      </p>
                    )}
                  </div>

                  {shipment ? (
                    <div className="border border-neutral-200 p-4 space-y-3 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium text-sm">Delivery &amp; Shipment</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="text-neutral-500">AWB / Waybill:</span>{" "}
                          <span className="font-mono">{shipment.waybill ?? "—"}</span>
                        </p>
                        <p>
                          <span className="text-neutral-500">Status:</span>{" "}
                          {formatCustomerShipmentStatus(order, liveTracking)}
                        </p>
                        {shipment.cancelledAt && (
                          <p className="text-red-600 font-medium">Shipment Cancelled</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
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
                                  <RefreshCw className="h-4 w-4 mr-1" /> Track Live
                                </>
                              )}
                            </Button>
                            {!shipment.cancelledAt && !isCancelled && !isReturnRequested && !isReturned && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none text-red-700 border-red-200 hover:bg-red-50"
                                disabled={actionLoading === waybill}
                                onClick={() => cancelShipment(waybill)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Cancel Shipment
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      {track && track.scans.length > 0 && (
                        <div className="text-sm pt-2">
                          <p className="font-medium mb-2">Tracking History</p>
                          <ul className="space-y-2 border-l-2 border-neutral-300 pl-3">
                            {track.scans.map((scan, i) => (
                              <li key={i}>
                                <p className="font-medium text-xs sm:text-sm">{scan.status}</p>
                                {scan.location && (
                                  <p className="text-xs text-neutral-500">{scan.location}</p>
                                )}
                                {scan.timestamp && (
                                  <p className="text-xs text-neutral-400 tabular-nums">{scan.timestamp}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    !isCancelled && (
                      <p className="text-sm text-neutral-600">
                        Shipment not created yet — we will notify you when it ships.
                      </p>
                    )
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
