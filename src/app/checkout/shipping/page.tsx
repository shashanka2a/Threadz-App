"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type ShippingAddress } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { addressToShipping } from "@/lib/addresses";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { CheckoutLoadingOverlay } from "@/components/checkout/checkout-loading-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PincodeChecker } from "@/components/shipping/pincode-checker";
import type { PincodeServiceability, ShippingEstimate } from "@/types/shipment";

const DEFAULT_COUNTRY = "India";

const checkoutInputClass =
  "rounded-none mt-1.5 border-neutral-300 bg-white focus-visible:border-foreground focus-visible:ring-foreground/20";

export default function ShippingPage() {
  const router = useRouter();
  const { cartItems, shippingAddress, setShippingAddress, setDeliveryFee } = useCart();
  const { user, profile, addresses, loading: authLoading } = useAuth();
  const [isCheckingCart, setIsCheckingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceability | null>(null);
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/cart");
      return;
    }
    setIsCheckingCart(false);
  }, [cartItems.length, router]);

  const initial = useMemo<ShippingAddress>(
    () => {
      if (shippingAddress) return shippingAddress;

      if (user && profile) {
        const defaultAddress =
          addresses.find((address) => address.isDefault) ?? addresses[0];
        if (defaultAddress) {
          return addressToShipping(defaultAddress, profile.email);
        }
        return {
          fullName: profile.full_name,
          phone: profile.phone,
          email: profile.email,
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: DEFAULT_COUNTRY,
        };
      }

      return {
        fullName: "",
        phone: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: DEFAULT_COUNTRY,
      };
    },
    [shippingAddress, user, profile, addresses],
  );

  const [form, setForm] = useState<ShippingAddress>(initial);

  useEffect(() => {
    setForm(initial);
    const defaultAddress =
      addresses.find((address) => address.isDefault) ?? addresses[0];
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [initial, addresses]);

  const applySavedAddress = (addressId: string) => {
    const address = addresses.find((item) => item.id === addressId);
    if (!address || !profile) return;
    setSelectedAddressId(addressId);
    setForm(addressToShipping(address, profile.email));
  };

  const setField = (k: keyof ShippingAddress, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (k === "postalCode") {
      setPincodeResult(null);
      setShippingEstimate(null);
      setDeliveryFee(0);
    }
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);
  const weightGrams = Math.max(250, itemCount * 250);

  useEffect(() => {
    const pin = form.postalCode.replace(/\D/g, "").slice(0, 6);
    if (pin.length !== 6) {
      setShippingEstimate(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEstimateLoading(true);
      try {
        const res = await fetch(
          `/api/shipping/estimate?pin=${encodeURIComponent(pin)}&weight=${weightGrams}`
        );
        const data = (await res.json()) as ShippingEstimate & { error?: string };
        if (res.ok) {
          setShippingEstimate(data);
          setDeliveryFee(data.estimatedCost);
        } else {
          setShippingEstimate(null);
          setDeliveryFee(0);
          if (data.error) {
            console.warn("[shipping estimate]", data.error);
          }
        }
      } catch {
        setShippingEstimate(null);
        setDeliveryFee(0);
      } finally {
        setEstimateLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.postalCode, weightGrams, setDeliveryFee]);

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "A valid email is required";
    if (!form.addressLine1.trim()) return "Address line 1 is required";
    if (!form.city.trim()) return "City is required";
    if (!form.state.trim()) return "State is required";
    if (!form.postalCode.trim()) return "Postal code is required";
    if (!form.country.trim()) return "Country is required";
    if (pincodeResult && !pincodeResult.serviceable) {
      return "Delivery is not available for this pincode";
    }
    const pin = form.postalCode.replace(/\D/g, "").slice(0, 6);
    if (pin.length === 6 && estimateLoading) {
      return "Calculating delivery fee, please wait";
    }
    if (pin.length === 6 && !shippingEstimate) {
      return "Could not calculate delivery fee for this pincode";
    }
    return null;
  };

  const onContinue = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    setShippingAddress(form);
    if (shippingEstimate) {
      setDeliveryFee(shippingEstimate.estimatedCost);
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push("/checkout/payment");
  };

  if (isCheckingCart || authLoading) {
    return <CheckoutLoadingOverlay message="Loading checkout..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {isSubmitting && (
        <CheckoutLoadingOverlay message="Saving shipping details..." />
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <Button variant="ghost" className="rounded-none w-fit" onClick={() => router.push("/cart")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to cart
        </Button>
        <div className="text-sm text-neutral-600">Checkout · Shipping</div>
      </div>

      <CheckoutProgress current="shipping" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-serif mb-6">Shipping details</h1>

              {user && addresses.length > 0 && (
                <div className="mb-6">
                  <Label className="text-sm mb-2 block">Saved addresses</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => applySavedAddress(address.id)}
                        className={`text-left border p-3 rounded-none transition-colors ${
                          selectedAddressId === address.id
                            ? "border-black bg-neutral-50"
                            : "border-neutral-300 hover:border-neutral-500"
                        }`}
                      >
                        <p className="font-medium text-sm">{address.label}</p>
                        <p className="text-xs text-neutral-600 mt-1">
                          {address.fullName} · {address.city}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!user && (
                <p className="text-sm text-neutral-600 mb-6">
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => router.push("/login?next=/checkout/shipping")}
                  >
                    Sign in
                  </button>{" "}
                  to use saved addresses.
                </p>
              )}

              <fieldset disabled={isSubmitting} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm">Full name</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="+91 ..."
                  />
                </div>

                <div>
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm">Address line 1</Label>
                  <Input
                    value={form.addressLine1}
                    onChange={(e) => setField("addressLine1", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="House no, street, area"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm">Address line 2 (optional)</Label>
                  <Input
                    value={form.addressLine2 ?? ""}
                    onChange={(e) => setField("addressLine2", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="Landmark, apartment, etc."
                  />
                </div>

                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <Label className="text-sm">Postal code</Label>
                  <Input
                    value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value)}
                    className={checkoutInputClass}
                    placeholder="400001"
                  />
                </div>

                <div className="md:col-span-2 border-t border-neutral-200 pt-4 mt-1">
                  <p className="text-sm font-medium text-neutral-900 mb-3">
                    Delivery availability
                  </p>
                  <PincodeChecker
                    compact
                    defaultPin={form.postalCode}
                    onResult={setPincodeResult}
                  />
                  {estimateLoading && (
                    <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                      Calculating your free delivery savings...
                    </p>
                  )}
                  {shippingEstimate && shippingEstimate.estimatedCost > 0 && (
                    <p className="text-sm mt-2 text-green-800 bg-green-50 border border-green-200 px-3 py-2">
                      <span className="font-medium">Free delivery unlocked!</span>{" "}
                      Save{" "}
                      <span className="line-through text-neutral-500">
                        ₹{shippingEstimate.estimatedCost}
                      </span>{" "}
                      — delivery fee waived at checkout.
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm">Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    className={checkoutInputClass}
                    placeholder={DEFAULT_COUNTRY}
                  />
                </div>
              </fieldset>

              <div className="mt-8 flex w-full flex-col gap-3 md:flex-row md:justify-end md:items-stretch">
                <Button
                  variant="outline"
                  className="rounded-none w-full md:w-auto order-2 md:order-1"
                  onClick={() => router.push("/shop")}
                  disabled={isSubmitting}
                >
                  Continue shopping
                </Button>
                <Button
                  className="rounded-none bg-black text-white hover:bg-neutral-800 w-full md:w-auto md:min-w-[180px] order-1 md:order-2"
                  onClick={onContinue}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Continuing...
                    </>
                  ) : (
                    "Continue to payment"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="lg:sticky lg:top-20">
            <OrderSummary deliveryLoading={estimateLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
