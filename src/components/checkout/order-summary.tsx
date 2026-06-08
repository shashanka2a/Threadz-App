"use client";

import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type OrderSummaryProps = {
  title?: string;
  showShippingLine?: boolean;
};

export function OrderSummary({
  title = "Order Summary",
  showShippingLine = true,
}: OrderSummaryProps) {
  const { cartTotal, cartItems } = useCart();

  const tax = useMemo(() => Math.round(cartTotal * 0.18), [cartTotal]);
  const shipping = 0;
  const total = cartTotal + tax + shipping;

  return (
    <Card className="border-neutral-200 rounded-none">
      <CardContent className="p-6">
        <h2 className="text-xl font-serif mb-6">{title}</h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span>Items</span>
            <span>{cartItems.reduce((sum, i) => sum + i.cartQuantity, 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{cartTotal}</span>
          </div>
          {showShippingLine && (
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Tax (estimated)</span>
            <span>₹{tax}</span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-600">
          • Free shipping on all orders
          <br />
          • 7-day return policy
          <br />• Secure payment processing
        </p>
      </CardContent>
    </Card>
  );
}

