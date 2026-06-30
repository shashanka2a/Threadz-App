import { NextResponse } from "next/server";
import { requireUserEmail } from "@/lib/auth/require-user";
import { getCustomerOrders } from "@/lib/db/customer-orders";

export async function GET() {
  try {
    await requireUserEmail();
    const orders = await getCustomerOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load orders";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
