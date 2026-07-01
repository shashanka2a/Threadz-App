"use client";

import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { computeCheckoutTotals, formatInr } from "@/lib/pricing";

type OrderSummaryProps = {
  title?: string;
  deliveryLoading?: boolean;
};

export function OrderSummary({
  title = "Order Summary",
  deliveryLoading = false,
}: OrderSummaryProps) {
  const { cartTotal, cartItems, deliveryFee } = useCart();

  const { tax, total, quotedDelivery } = useMemo(
    () => computeCheckoutTotals(cartTotal, deliveryFee),
    [cartTotal, deliveryFee],
  );

  const showDeliveryPromo = deliveryLoading || quotedDelivery > 0;

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
            <span>{formatInr(cartTotal)}</span>
          </div>

          {showDeliveryPromo && (
            <>
              <div className="flex justify-between text-sm gap-4">
                <span>Delivery fee</span>
                <span className="text-right shrink-0">
                  {deliveryLoading ? (
                    <span className="inline-flex items-center gap-1.5 text-neutral-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Calculating...
                    </span>
                  ) : (
                    <span className="text-neutral-400 line-through tabular-nums">
                      {formatInr(quotedDelivery)}
                    </span>
                  )}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between text-sm text-neutral-600">
            <span>GST (18%, included)</span>
            <span>{formatInr(tax)}</span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-medium">
            <span>Total</span>
            <span>{formatInr(total)}</span>
          </div>
          <p className="text-xs text-neutral-500">All product prices inclusive of taxes</p>
        </div>

        <p className="text-xs text-neutral-600">
          • Free delivery
          <br />
          • 7-day return policy
          <br />• Secure payment processing
        </p>
      </CardContent>
    </Card>
  );
}
