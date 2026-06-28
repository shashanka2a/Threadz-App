"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { CheckoutLoadingOverlay } from "@/components/checkout/checkout-loading-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type RazorpayCheckout = new (options: Record<string, unknown>) => { open: () => void };

function getRazorpayCheckout(): RazorpayCheckout | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Razorpay?: RazorpayCheckout }).Razorpay;
}

function formatAddressLine(address: NonNullable<ReturnType<typeof useCart>["shippingAddress"]>) {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function PaymentPage() {
  const router = useRouter();
  const { cartItems, cartTotal, shippingAddress, clearCart, clearShippingAddress } = useCart();
  const [isChecking, setIsChecking] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/cart");
      return;
    }
    if (!shippingAddress) {
      router.replace("/checkout/shipping");
      return;
    }
    setIsChecking(false);
  }, [cartItems.length, shippingAddress, router]);

  const orderId = useMemo(() => {
    const now = Date.now().toString(36).toUpperCase();
    return `TZ-${now.slice(-8)}`;
  }, []);

  const tax = useMemo(() => Math.round(cartTotal * 0.18), [cartTotal]);
  const total = cartTotal + tax;

  const payAndProceed = async () => {
    if (!shippingAddress) return;

    setIsPlacingOrder(true);
    try {
      const createRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, currency: "INR", receipt: orderId }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create payment order");
      }

      const order = (await createRes.json()) as {
        id: string;
        amount: number;
        currency: string;
        receipt?: string;
      };

      const loadRazorpay = () =>
        new Promise<boolean>((resolve) => {
          if (typeof window === "undefined") return resolve(false);
          if (getRazorpayCheckout()) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay SDK");

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) throw new Error("Payment service is not configured");

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Threadz",
        description: `Order ${order.receipt ?? order.id}`,
        order_id: order.id,
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled. Please try again.");
            setIsPlacingOrder(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok || verifyData.status !== "success") {
              throw new Error(verifyData.message ?? "Payment verification failed");
            }

            const orderResponse = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                shippingAddress,
                paymentMethod: "razorpay",
                cartItems,
                subtotal: cartTotal,
                tax,
                total,
              }),
            });

            const orderData = (await orderResponse.json()) as { error?: string; orderId?: string };
            if (!orderResponse.ok) {
              throw new Error(orderData.error ?? "Failed to save order");
            }

            toast.success("Payment successful. Order placed!");
            clearCart();
            clearShippingAddress();
            router.push(
              `/checkout/success?orderId=${encodeURIComponent(orderData.orderId ?? orderId)}`,
            );
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Payment verification failed";
            toast.error(msg);
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: { color: "#000000" },
      };

      const Razorpay = getRazorpayCheckout();
      if (!Razorpay) throw new Error("Failed to load Razorpay SDK");

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      toast.error(message);
      setIsPlacingOrder(false);
    }
  };

  if (isChecking || !shippingAddress) {
    return <CheckoutLoadingOverlay message="Loading payment..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {isPlacingOrder && (
        <CheckoutLoadingOverlay message="Opening secure payment..." />
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <Button
          variant="ghost"
          className="rounded-none w-fit"
          onClick={() => router.push("/checkout/shipping")}
          disabled={isPlacingOrder}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to shipping
        </Button>
        <div className="text-sm text-neutral-600">Checkout · Payment</div>
      </div>

      <CheckoutProgress current="payment" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-serif mb-2">Payment</h1>
              <p className="text-sm text-neutral-600 mb-6">
                Pay securely via Razorpay. Choose UPI, cards, netbanking, or wallets in the
                next step.
              </p>

              <div className="flex items-start gap-3 border border-neutral-200 bg-neutral-50 p-4 rounded-none mb-8">
                <ShieldCheck className="h-5 w-5 text-neutral-700 mt-0.5 shrink-0" />
                <div className="text-sm text-neutral-600">
                  <p className="font-medium text-neutral-900 mb-1">Secure checkout powered by Razorpay</p>
                  <p>UPI, debit/credit cards, netbanking, and wallets are available in the payment window.</p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row md:justify-end md:items-stretch">
                <Button
                  variant="outline"
                  className="rounded-none w-full md:w-auto order-2 md:order-1"
                  onClick={() => router.push("/checkout/shipping")}
                  disabled={isPlacingOrder}
                >
                  Edit shipping
                </Button>
                <Button
                  className="rounded-none bg-black text-white hover:bg-neutral-800 w-full md:w-auto md:min-w-[200px] order-1 md:order-2"
                  onClick={payAndProceed}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay & Proceed"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-3">Shipping to</h2>
              <p className="text-sm">
                <span className="font-medium">{shippingAddress.fullName}</span>
                <br />
                <span className="text-neutral-600">{formatAddressLine(shippingAddress)}</span>
                <br />
                <span className="text-neutral-600">{shippingAddress.phone}</span>
                {" · "}
                <span className="text-neutral-600">{shippingAddress.email}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="lg:sticky lg:top-20">
            <OrderSummary title="Order Summary" />
          </div>
        </div>
      </div>
    </div>
  );
}
