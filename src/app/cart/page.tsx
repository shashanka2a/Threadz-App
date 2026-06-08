"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const handleCheckout = () => {
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
    <div className="container mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => router.push("/shop")}
        className="mb-8 rounded-none"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Continue Shopping
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif">Shopping Cart</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="rounded-none"
            >
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card
                key={`${item.id}-${item.selectedSize}`}
                className="border-neutral-200 rounded-none"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 bg-neutral-100 overflow-hidden flex-shrink-0">
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

                      <div className="flex items-center justify-between">
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
                            className="h-8 w-8 rounded-none border-neutral-300"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.cartQuantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.selectedSize,
                                item.cartQuantity + 1
                              )
                            }
                            className="h-8 w-8 rounded-none border-neutral-300"
                          >
                            +
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg">₹{item.price * item.cartQuantity}</p>
                          <p className="text-xs text-neutral-500">₹{item.price} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="border-neutral-200 rounded-none sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Tax (estimated)</span>
                  <span>₹{Math.round(cartTotal * 0.18)}</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>₹{cartTotal + Math.round(cartTotal * 0.18)}</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleCheckout}
                className="w-full bg-black text-white hover:bg-neutral-800 rounded-none"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-xs text-neutral-600">
                  • Free shipping on all orders
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
