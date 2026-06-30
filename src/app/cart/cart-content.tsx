"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    router.push("/checkout/shipping");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
          <h2 className="text-3xl font-serif mb-4">Your Cart is Empty</h2>
          <p className="text-neutral-600 mb-8">Start adding some products to your cart!</p>
          <Button
            onClick={() => router.push("/shop")}
            className="bg-black text-white hover:bg-neutral-800 rounded-none"
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
        className="mb-8 rounded-none"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Continue Shopping
      </Button>

      <CheckoutProgress current="cart" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif">Shopping Cart</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="rounded-none w-full sm:w-auto"
            >
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => {
              const maxQty = getSizeStock(item, item.selectedSize);
              const atMax = item.cartQuantity >= maxQty;
              const unavailable = maxQty <= 0;

              return (
                <Card
                  key={`${item.id}-${item.selectedSize}`}
                  className="border-neutral-200 rounded-none"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-24 h-48 sm:h-24 bg-neutral-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div>
                            <h3 className="text-lg">{item.name}</h3>
                            <p className="text-sm text-neutral-600">
                              {item.color} • Size: {item.selectedSize}
                            </p>
                            {unavailable && (
                              <Badge className="mt-1 rounded-none text-[10px] bg-red-100 text-red-800 hover:bg-red-100">
                                No longer in stock — remove to continue
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="rounded-none"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.selectedSize,
                                  item.cartQuantity - 1
                                )
                              }
                              className="h-10 w-10 rounded-none border-neutral-300"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.cartQuantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
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
                              className="h-10 w-10 rounded-none border-neutral-300 disabled:opacity-40"
                            >
                              +
                            </Button>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg">₹{item.price * item.cartQuantity}</p>
                            <p className="text-xs text-neutral-500">₹{item.price} each</p>
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
          <Card className="border-neutral-200 rounded-none lg:sticky lg:top-20">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatInr(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>GST (18%, included)</span>
                  <span>{formatInr(tax)}</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>{formatInr(total)}</span>
                </div>
                <p className="text-xs text-neutral-500">All prices inclusive of taxes</p>
              </div>

              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut || hasUnavailableItems}
                className="w-full bg-black text-white hover:bg-neutral-800 rounded-none disabled:opacity-50"
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

              <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-xs text-neutral-600">
                  • Free delivery applied at checkout
                  <br />
                  • 7-day return policy
                  <br />• Secure payment processing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
