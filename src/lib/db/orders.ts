import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CartItem } from "@/types/product";
import type { ShippingAddress } from "@/context/CartContext";

export type CreateOrderInput = {
  orderId: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
};

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createPublicClient();

  const { error: orderError } = await supabase.from("orders").insert({
    id: input.orderId,
    full_name: input.shippingAddress.fullName,
    phone: input.shippingAddress.phone,
    email: input.shippingAddress.email,
    address_line1: input.shippingAddress.addressLine1,
    address_line2: input.shippingAddress.addressLine2 ?? null,
    city: input.shippingAddress.city,
    state: input.shippingAddress.state,
    postal_code: input.shippingAddress.postalCode,
    country: input.shippingAddress.country,
    payment_method: input.paymentMethod,
    subtotal: input.subtotal,
    tax: input.tax,
    total: input.total,
    status: "confirmed",
  });

  if (orderError) {
    throw new Error(orderError.message);
  }

  const orderItems = input.cartItems.map((item) => ({
    order_id: input.orderId,
    product_id: item.id,
    product_name: item.name,
    color: item.color,
    size: item.selectedSize,
    quantity: item.cartQuantity,
    unit_price: item.price,
    line_total: item.price * item.cartQuantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { orderId: input.orderId };
}
