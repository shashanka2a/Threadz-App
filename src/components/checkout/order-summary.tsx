"use client";

import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles } from "lucide-react";
import { computeCheckoutTotals, formatInr } from "@/lib/pricing";

type OrderSummaryProps = {
  title?: string;
  deliveryLoading?: boolean;
};

export function OrderSummary({
  title = "Order Summary",
  deliveryLoading = false,
}: OrderSummaryProps) {
  const { rawCartTotal, bundleDiscount, cartItems, deliveryFee } = useCart();

  const { tax, total, quotedDelivery } = useMemo(
    () => computeCheckoutTotals(rawCartTotal, deliveryFee, bundleDiscount),
    [rawCartTotal, deliveryFee, bundleDiscount],
  );

  const showDeliveryPromo = deliveryLoading || quotedDelivery > 0;

  return (
    <Card className="border-border rounded-none bg-card">
      <CardContent className="p-6">
        <h2 className="text-xl font-serif mb-6 text-foreground">{title}</h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span className="text-foreground font-medium">{cartItems.reduce((sum, i) => sum + i.cartQuantity, 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground font-medium">{formatInr(rawCartTotal)}</span>
          </div>

          {bundleDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Bundle Offer (3 for ₹999)
              </span>
              <span>-{formatInr(bundleDiscount)}</span>
            </div>
          )}

          {showDeliveryPromo && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="text-right shrink-0">
                {deliveryLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Calculating...
                  </span>
                ) : (
                  <span className="text-muted-foreground line-through tabular-nums">
                    {formatInr(quotedDelivery)}
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>GST (18%, included)</span>
            <span>{formatInr(tax)}</span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-medium text-foreground">
            <span>Total</span>
            <div className="text-right">
              <span>{formatInr(total)}</span>
              {bundleDiscount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 font-normal">
                  You save {formatInr(bundleDiscount)}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">All product prices inclusive of taxes</p>
        </div>

        <div className="p-3.5 bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground space-y-1">
            <span>• Free delivery applied</span>
            <br />
            <span>• 7-day return policy</span>
            <br />
            <span>• Secure payment processing</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

