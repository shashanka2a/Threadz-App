"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type ShippingAddress } from "@/context/CartContext";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_COUNTRY = "India";

export default function ShippingPage() {
  const router = useRouter();
  const { cartItems, shippingAddress, setShippingAddress } = useCart();

  useEffect(() => {
    if (cartItems.length === 0) router.replace("/cart");
  }, [cartItems.length, router]);

  const initial = useMemo<ShippingAddress>(
    () =>
      shippingAddress ?? {
        fullName: "",
        phone: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: DEFAULT_COUNTRY,
      },
    [shippingAddress],
  );

  const [form, setForm] = useState<ShippingAddress>(initial);

  useEffect(() => {
    // if context updates (back from payment), keep it in sync
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress?.fullName]);

  const setField = (k: keyof ShippingAddress, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required";
    if (!form.phone.trim()) return "Phone number is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "A valid email is required";
    if (!form.addressLine1.trim()) return "Address line 1 is required";
    if (!form.city.trim()) return "City is required";
    if (!form.state.trim()) return "State is required";
    if (!form.postalCode.trim()) return "Postal code is required";
    if (!form.country.trim()) return "Country is required";
    return null;
  };

  const onContinue = () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setShippingAddress(form);
    router.push("/checkout/payment");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" className="rounded-none" onClick={() => router.push("/cart")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to cart
        </Button>
        <div className="text-sm text-neutral-600">Checkout · Shipping</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-6">
              <h1 className="text-3xl font-serif mb-6">Shipping details</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm">Full name</Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="+91 ..."
                  />
                </div>

                <div>
                  <Label className="text-sm">Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm">Address line 1</Label>
                  <Input
                    value={form.addressLine1}
                    onChange={(e) => setField("addressLine1", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="House no, street, area"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm">Address line 2 (optional)</Label>
                  <Input
                    value={form.addressLine2 ?? ""}
                    onChange={(e) => setField("addressLine2", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="Landmark, apartment, etc."
                  />
                </div>

                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <Label className="text-sm">Postal code</Label>
                  <Input
                    value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder="400001"
                  />
                </div>

                <div>
                  <Label className="text-sm">Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    className="rounded-none mt-1.5"
                    placeholder={DEFAULT_COUNTRY}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <Button variant="outline" className="rounded-none" onClick={() => router.push("/shop")}>
                  Continue shopping
                </Button>
                <Button className="rounded-none bg-black text-white hover:bg-neutral-800" onClick={onContinue}>
                  Continue to payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="sticky top-4">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

