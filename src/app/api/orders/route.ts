import { NextResponse } from "next/server";
import { createOrder, type CreateOrderInput } from "@/lib/db/orders";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderInput;

    if (!body.orderId || !body.shippingAddress || !body.cartItems?.length) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        orderId: body.orderId,
        persisted: false,
        message: "Order confirmed locally (Supabase not configured)",
      });
    }

    const result = await createOrder(body);

    return NextResponse.json({
      orderId: result.orderId,
      persisted: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
