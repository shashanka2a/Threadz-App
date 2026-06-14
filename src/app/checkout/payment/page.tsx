"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { CheckoutLoadingOverlay } from "@/components/checkout/checkout-loading-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Landmark, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "upi" | "card" | "cod";

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
  const [method, setMethod] = useState<PaymentMethod>("upi");
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

  const placeOrder = async () => {
    if (!shippingAddress) return;

    setIsPlacingOrder(true);
    try {
      // For Cash on Delivery, continue with existing order flow
      if (method === "cod") {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            shippingAddress,
            paymentMethod: method,
            cartItems,
            subtotal: cartTotal,
            tax,
            total,
          }),
        });

        const data = (await response.json()) as { error?: string; orderId?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to place order");
        }

        toast.success("Order placed! Payment on delivery.");
        clearCart();
        clearShippingAddress();
        router.push(`/checkout/success?orderId=${encodeURIComponent(data.orderId ?? orderId)}`);
        return;
      }

      // For online payments (UPI / Card) create Razorpay order on the Next.js server
      const createRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, currency: "INR", receipt: orderId }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create payment order");
      }

      const order = (await createRes.json()) as any;

      // Load Razorpay checkout script
      const loadRazorpay = () =>
        new Promise<boolean>((resolve) => {
          if (typeof window === "undefined") return resolve(false);
          if ((window as any).Razorpay) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay SDK");

      // Public test key (matches server). Replace with env var in production.
      const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;;

      const options = {
        key: RAZORPAY_KEY,
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
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
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
                paymentMethod: method,
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
              `/checkout/success?orderId=${encodeURIComponent(orderData.orderId ?? orderId)}`
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
      } as any;

      const rzp = new (window as any).Razorpay(options);
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
    <div className="container mx-auto px-4 py-12">
      {isPlacingOrder && (
        <CheckoutLoadingOverlay message="Processing your payment..." />
      )}

      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          className="rounded-none"
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
            <CardContent className="p-6">
              <h1 className="text-3xl font-serif mb-2">Payment</h1>
              <p className="text-sm text-neutral-600">
                Choose a payment method to complete your order.
              </p>

              <fieldset disabled={isPlacingOrder} className="mt-6">
                <Label className="text-sm">Payment method</Label>
                <RadioGroup
                  className="mt-3 space-y-3"
                  value={method}
                  onValueChange={(v) => setMethod(v as PaymentMethod)}
                >
                  <div className="flex items-start gap-3 border border-neutral-300 bg-white p-4 rounded-none">
                    <RadioGroupItem value="upi" id="upi" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <Label htmlFor="upi" className="font-medium">
                          UPI
                        </Label>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Pay via UPI apps (GPay, PhonePe, Paytm).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border border-neutral-300 bg-white p-4 rounded-none">
                    <RadioGroupItem value="card" id="card" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <Label htmlFor="card" className="font-medium">
                          Card
                        </Label>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Debit / Credit card.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border border-neutral-300 bg-white p-4 rounded-none">
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        <Label htmlFor="cod" className="font-medium">
                          Cash on delivery
                        </Label>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Pay when the order arrives.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </fieldset>

              <div className="mt-8 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-none"
                  onClick={() => router.push("/checkout/shipping")}
                  disabled={isPlacingOrder}
                >
                  Edit shipping
                </Button>
                <Button
                  className="rounded-none bg-black text-white hover:bg-neutral-800 min-w-[180px]"
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay & place order"
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
          <div className="sticky top-4">
            <OrderSummary title="Order Summary" />
          </div>
        </div>
      </div>
    </div>
  );
}
