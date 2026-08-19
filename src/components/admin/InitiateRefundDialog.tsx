"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminOrder } from "@/lib/db/admin-orders";
import { getOrderRefundInfo } from "@/lib/razorpay-refund";

type InitiateRefundDialogProps = {
  order: AdminOrder;
  onSuccess?: () => void;
  triggerButton?: React.ReactNode;
};

export function InitiateRefundDialog({
  order,
  onSuccess,
  triggerButton,
}: InitiateRefundDialogProps) {
  const [open, setOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState(order.total.toString());
  const [reason, setReason] = useState("Order cancelled - customer refund");
  const [loading, setLoading] = useState(false);

  const refundInfo = getOrderRefundInfo(order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (refundInfo) {
      toast.info("Refund is already processed for this order");
      setOpen(false);
      return;
    }

    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(order.id)}/refund`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: paymentId.trim() || undefined,
            amountInRupees: amountNum,
            reason: reason.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to process refund");
      }

      toast.success(
        data.message ?? `Refund initiated successfully (ID: ${data.refundId})`
      );
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          refundInfo ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs gap-1.5 font-medium"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Refunded (₹{refundInfo.amount})
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Initiate Refund
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="rounded-none max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-blue-600 font-serif text-xl">
              <CreditCard className="h-5 w-5 shrink-0" />
              <DialogTitle className="font-serif">
                {refundInfo ? "Razorpay Refund Receipt" : "Initiate Razorpay Refund"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-600 pt-1">
              {refundInfo
                ? "This refund has been completed and verified via Razorpay API."
                : "Process an instant or normal refund back to the customer's original payment method via Razorpay API."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-sm">
            {refundInfo && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Refund Processed Successfully
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-emerald-800">
                  <div>
                    <span className="text-emerald-600">Refund ID:</span>{" "}
                    <span className="font-mono font-medium text-emerald-950">{refundInfo.refundId}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Amount:</span>{" "}
                    <span className="font-semibold text-emerald-950 font-mono">₹{refundInfo.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Status:</span>{" "}
                    <span className="uppercase font-semibold text-emerald-900">{refundInfo.status}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Payment ID:</span>{" "}
                    <span className="font-mono text-emerald-950">{refundInfo.paymentId}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-neutral-50 p-3 border border-neutral-200 rounded-none space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500 text-xs">Order ID:</span>
                <span className="font-mono font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 text-xs">Customer:</span>
                <span className="font-medium">{order.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 text-xs">Payment Method:</span>
                <Badge variant="outline" className="rounded-none text-[10px] uppercase">
                  {order.paymentMethod}
                </Badge>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-1">
                <span className="text-neutral-500 text-xs">Order Total:</span>
                <span className="font-semibold tabular-nums">₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            {!refundInfo && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="refund-amount" className="text-xs font-medium">
                    Refund Amount (₹ INR) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="refund-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    max={order.total}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                    className="rounded-none font-mono"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Defaulted to full order total. Partial refunds are also supported.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payment-id" className="text-xs font-medium">
                    Razorpay Payment ID <span className="text-neutral-400 font-normal">(pay_...)</span>
                  </Label>
                  <Input
                    id="payment-id"
                    placeholder="e.g. pay_Nabc123xyz"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    className="rounded-none font-mono text-xs"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Found in your Razorpay Dashboard under Payments for this order.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="refund-reason" className="text-xs font-medium">
                    Refund Reason / Notes
                  </Label>
                  <Input
                    id="refund-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-none text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>
                    Razorpay securely credits the customer account directly to their original UPI / card source.
                  </span>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {refundInfo ? (
              <Button
                type="button"
                className="rounded-none bg-neutral-900 text-white hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Close Receipt
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-none bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calling Razorpay API...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Process Razorpay Refund
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
