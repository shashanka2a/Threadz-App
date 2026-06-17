import type { ShippingAddress } from "@/context/CartContext";
import type { AddressRow } from "@/lib/supabase/database.types";

export type SavedAddress = {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export function mapAddressRow(row: AddressRow): SavedAddress {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2 ?? undefined,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

export function addressToShipping(address: SavedAddress, email: string): ShippingAddress {
  return {
    fullName: address.fullName,
    phone: address.phone,
    email,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

export function profileToShipping(
  profile: { fullName: string; phone: string; email: string },
  address?: SavedAddress,
): ShippingAddress | null {
  if (!address) {
    if (!profile.fullName || !profile.phone) return null;
    return {
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    };
  }
  return addressToShipping(address, profile.email);
}
