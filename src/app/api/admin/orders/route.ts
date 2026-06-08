import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminOrders } from "@/lib/db/admin-orders";

export async function GET() {
  try {
    await requireAdminSession();
    const orders = await getAdminOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load orders";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
