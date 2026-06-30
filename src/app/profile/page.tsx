"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, LogOut, MapPin, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { MyOrders } from "@/components/customer/my-orders";
import { createClient } from "@/lib/supabase/client";
import type { SavedAddress } from "@/lib/addresses";

const inputClass = "rounded-none mt-1.5 border-neutral-300";

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, addresses, loading, signOut, refreshProfile, refreshAddresses } =
    useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/profile");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone);
    }
  }, [profile]);

  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddress,
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      isDefault: addresses.length === 0,
    });
    setAddressDialogOpen(true);
  };

  const openEditAddress = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setAddressDialogOpen(true);
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);

    setSavingProfile(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated");
    await refreshProfile();
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSavingAddress(true);

    const payload = {
      user_id: user.id,
      label: addressForm.label,
      full_name: addressForm.fullName,
      phone: addressForm.phone,
      address_line1: addressForm.addressLine1,
      address_line2: addressForm.addressLine2 || null,
      city: addressForm.city,
      state: addressForm.state,
      postal_code: addressForm.postalCode,
      country: addressForm.country,
      is_default: addressForm.isDefault,
    };

    const { error } = editingAddressId
      ? await supabase.from("addresses").update(payload).eq("id", editingAddressId)
      : await supabase.from("addresses").insert(payload);

    setSavingAddress(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingAddressId ? "Address updated" : "Address saved");
    setAddressDialogOpen(false);
    await refreshAddresses();
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Address removed");
    await refreshAddresses();
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Default address updated");
    await refreshAddresses();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-600">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif mb-1">My Profile</h1>
          <p className="text-sm text-neutral-600 break-all">{profile?.email ?? user.email}</p>
        </div>
        <Button variant="outline" className="rounded-none w-full sm:w-auto" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Account details</h2>
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Email</Label>
                <Input
                  value={profile?.email ?? user.email ?? ""}
                  disabled
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  className="rounded-none bg-black text-white hover:bg-neutral-800"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5" />
                My orders
              </h2>
              <p className="text-sm text-neutral-600">
                Track shipments, download labels, and manage deliveries.
              </p>
            </div>
            <MyOrders />
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium">Saved addresses</h2>
                <p className="text-sm text-neutral-600">
                  Use these at checkout for faster delivery.
                </p>
              </div>
              <Button
                className="rounded-none bg-black text-white hover:bg-neutral-800 w-full sm:w-auto"
                onClick={openNewAddress}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="border border-dashed border-neutral-300 p-8 text-center text-neutral-600">
                <MapPin className="h-8 w-8 mx-auto mb-3 text-neutral-400" />
                <p>No saved addresses yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{address.label}</span>
                        {address.isDefault && (
                          <Badge className="rounded-none bg-yellow-400 text-black hover:bg-yellow-400">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-800">{address.fullName}</p>
                      <p className="text-sm text-neutral-600">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-neutral-600">{address.phone}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none"
                        onClick={() => openEditAddress(address)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle>{editingAddressId ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveAddress} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Label</Label>
                <Input
                  value={addressForm.label}
                  onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                  className={inputClass}
                  placeholder="Home, Office..."
                  required
                />
              </div>
              <div>
                <Label>Full name</Label>
                <Input
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address line 1</Label>
                <Input
                  value={addressForm.addressLine1}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address line 2</Label>
                <Input
                  value={addressForm.addressLine2}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={addressForm.state}
                  onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input
                  value={addressForm.postalCode}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, postalCode: e.target.value }))
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <label className="md:col-span-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))
                  }
                />
                Set as default address
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                onClick={() => setAddressDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-none bg-black text-white hover:bg-neutral-800"
                disabled={savingAddress}
              >
                {savingAddress ? "Saving..." : "Save address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
