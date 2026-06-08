"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Landmark, Wallet } from "lucide-react";
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
  const { cartItems, shippingAddress, clearCart, clearShippingAddress } = useCart();

  useEffect(() => {
    if (cartItems.length === 0) router.replace("/cart");
  }, [cartItems.length, router]);

  useEffect(() => {
    if (!shippingAddress) router.replace("/checkout/shipping");
  }, [shippingAddress, router]);

  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const orderId = useMemo(() => {
    // lightweight deterministic-ish id for demo flow
    const now = Date.now().toString(36).toUpperCase();
    return `TZ-${now.slice(-8)}`;
  }, []);

  const placeOrder = async () => {
    if (!shippingAddress) return;

    setIsPlacingOrder(true);
    try {
      // Simulate payment processing
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Payment accepted. Order placed!");
      clearCart();
      clearShippingAddress();
      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!shippingAddress) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          className="rounded-none"
          onClick={() => router.push("/checkout/shipping")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to shipping
        </Button>
        <div className="text-sm text-neutral-600">Checkout · Payment</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-6">
              <h1 className="text-3xl font-serif mb-2">Payment</h1>
              <p className="text-sm text-neutral-600">
                Choose a payment method. (This demo flow simulates payment success.)
              </p>

              <div className="mt-6">
                <Label className="text-sm">Payment method</Label>
                <RadioGroup
                  className="mt-3 space-y-3"
                  value={method}
                  onValueChange={(v) => setMethod(v as PaymentMethod)}
                >
                  <div className="flex items-start gap-3 border border-neutral-200 p-4 rounded-none">
                    <RadioGroupItem value="upi" id="upi" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <Label htmlFor="upi" className="font-medium">
                          UPI
                        </Label>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Pay via UPI apps (simulated).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border border-neutral-200 p-4 rounded-none">
                    <RadioGroupItem value="card" id="card" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <Label htmlFor="card" className="font-medium">
                          Card
                        </Label>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Debit / Credit card (simulated).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border border-neutral-200 p-4 rounded-none">
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
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-none"
                  onClick={() => router.push("/checkout/shipping")}
                >
                  Edit shipping
                </Button>
                <Button
                  className="rounded-none bg-black text-white hover:bg-neutral-800"
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? "Placing order..." : "Pay & place order"}
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

