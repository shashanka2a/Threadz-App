import { getRazorpayClient, getRazorpayErrorMessage, toRazorpayAmountPaise } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type InitiateRefundInput = {
  orderId: string;
  paymentId?: string;
  amountInRupees?: number;
  notes?: Record<string, string>;
  reason?: string;
};

export type InitiateRefundResult =
  | {
      ok: true;
      refundId: string;
      paymentId: string;
      amount: number;
      currency: string;
      status: string;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function processRazorpayRefund(
  input: InitiateRefundInput
): Promise<InitiateRefundResult> {
  const { orderId, amountInRupees, notes, reason } = input;

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Database is not configured" };
  }

  const supabase = createAdminClient();

  // 1. Fetch the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? `Order #${orderId} not found` };
  }

  const refundAmountRupees = amountInRupees ?? Number(order.total);
  if (refundAmountRupees <= 0) {
    return { ok: false, error: "Refund amount must be greater than zero" };
  }

  const amountPaise = toRazorpayAmountPaise(refundAmountRupees);

  // 2. Identify the Razorpay payment ID
  let targetPaymentId = input.paymentId?.trim();

  // If no explicit paymentId is passed, check if order.id looks like or contains a payment id, or search via Razorpay API
  const rzp = getRazorpayClient();

  if (!targetPaymentId) {
    try {
      // Attempt to look up payments associated with this order ID / receipt in Razorpay
      const payments = await rzp.orders.fetchPayments(orderId);
      if (payments?.items && payments.items.length > 0) {
        const capturedPayment = payments.items.find(
          (p: { status: string; id: string }) => p.status === "captured"
        );
        if (capturedPayment) {
          targetPaymentId = capturedPayment.id;
        }
      }
    } catch {
      // Order ID might not be a Razorpay order entity id
    }
  }

  if (!targetPaymentId) {
    return {
      ok: false,
      error:
        "Razorpay Payment ID (e.g. pay_...) is required to initiate an automated refund. Please provide the Payment ID from your Razorpay dashboard.",
    };
  }

  // 3. Call Razorpay Refund API
  try {
    const refundPayload: {
      amount: number;
      notes: Record<string, string>;
      speed?: "normal" | "optimum";
    } = {
      amount: amountPaise,
      notes: {
        orderId: order.id,
        customerName: order.full_name,
        customerEmail: order.email,
        reason: reason ?? "Admin initiated cancellation refund",
        ...notes,
      },
    };

    const refund = await rzp.payments.refund(targetPaymentId, refundPayload);

    return {
      ok: true,
      refundId: refund.id,
      paymentId: targetPaymentId,
      amount: refundAmountRupees,
      currency: refund.currency ?? "INR",
      status: refund.status ?? "processed",
      message: `Refund of ₹${refundAmountRupees.toLocaleString()} initiated successfully via Razorpay (Refund ID: ${refund.id}).`,
    };
  } catch (error) {
    const errMsg = getRazorpayErrorMessage(error);
    return {
      ok: false,
      error: `Razorpay Refund Failed: ${errMsg}`,
    };
  }
}
