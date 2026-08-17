"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { computeCheckoutTotals, formatInr } from "@/lib/pricing";
import { getSizeStock } from "@/lib/stock";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/types/product";

type CartContentProps = {
  liveProducts: Product[];
};

export default function CartContent({ liveProducts }: CartContentProps) {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, syncCartStock } =
    useCart();
  const { tax, total } = computeCheckoutTotals(cartTotal);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    syncCartStock(liveProducts);
  }, [liveProducts, syncCartStock]);

  const hasUnavailableItems = cartItems.some(
    (item) => getSizeStock(item, item.selectedSize) <= 0
  );

  const handleCheckout = async () => {
    if (hasUnavailableItems) {
      toast.error("Remove out-of-stock items before checkout");
      return;
    }

    setIsCheckingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.push("/checkout/shipping");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-3xl font-serif mb-4 text-foreground">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Start adding some products to your cart!</p>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-8 h-11 transition-transform hover:scale-105"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Button
        variant="ghost"
        onClick={() => router.push("/shop")}
        className="mb-8 rounded-none text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
        Continue Shopping
      </Button>

      <CheckoutProgress current="cart" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif text-foreground">
              Shopping Cart ({cartItems.reduce((acc, i) => acc + i.cartQuantity, 0)})
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="rounded-none w-full sm:w-auto border-border text-foreground hover:bg-muted"
            >
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4" role="list" aria-label="Cart items">
            {cartItems.map((item) => {
              const maxQty = getSizeStock(item, item.selectedSize);
              const atMax = item.cartQuantity >= maxQty;
              const unavailable = maxQty <= 0;

              return (
                <Card
                  key={`${item.id}-${item.selectedSize}`}
                  className="border-border rounded-none bg-card overflow-hidden transition-all hover:shadow-md"
                  role="listitem"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-24 h-48 sm:h-24 bg-muted/40 overflow-hidden shrink-0 border border-border">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          sizes="96px"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div>
                            <h2 className="text-lg font-medium text-card-foreground">{item.name}</h2>
                            <p className="text-sm text-muted-foreground">
                              {item.color} • Size: {item.selectedSize}
                            </p>
                            {unavailable && (
                              <Badge className="mt-1 rounded-none text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                No longer in stock — remove to continue
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${item.name} size ${item.selectedSize} from cart`}
                            onClick={() => {
                              removeFromCart(item.id, item.selectedSize);
                              toast.success(`Removed ${item.name} from cart`);
                            }}
                            className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Remove {item.name}</span>
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.selectedSize,
                                  item.cartQuantity - 1
                                )
                              }
                              className="h-10 w-10 rounded-none border-border font-bold text-foreground hover:bg-muted"
                            >
                              -
                            </Button>
                            <span
                              className="w-8 text-center text-foreground font-medium tabular-nums"
                              aria-label={`Quantity: ${item.cartQuantity}`}
                            >
                              {item.cartQuantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label={`Increase quantity of ${item.name}`}
                              disabled={atMax || unavailable}
                              onClick={() => {
                                const ok = updateQuantity(
                                  item.id,
                                  item.selectedSize,
                                  item.cartQuantity + 1
                                );
                                if (!ok) {
                                  toast.error(
                                    `Only ${maxQty} available in size ${item.selectedSize}`
                                  );
                                }
                              }}
                              className="h-10 w-10 rounded-none border-border font-bold text-foreground hover:bg-muted disabled:opacity-40"
                            >
                              +
                            </Button>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-medium text-card-foreground">₹{item.price * item.cartQuantity}</p>
                            <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <Card className="border-border rounded-none bg-card lg:sticky lg:top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif mb-6 text-foreground">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">{formatInr(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST (18%, included)</span>
                  <span>{formatInr(tax)}</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-medium text-foreground">
                  <span>Total</span>
                  <span>{formatInr(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">All prices inclusive of taxes</p>
              </div>

              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut || hasUnavailableItems}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 text-base font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting checkout...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>

              <div className="mt-6 p-4 bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground space-y-1">
                  <span>• Free delivery applied at checkout</span>
                  <br />
                  <span>• 7-day return policy</span>
                  <br />
                  <span>• Secure payment processing</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

