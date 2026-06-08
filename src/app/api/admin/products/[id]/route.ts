import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { deactivateProduct, getAdminProducts, updateProduct } from "@/lib/db/admin-products";
import type { Product } from "@/types/product";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = (await request.json()) as Partial<Product>;

    const products = await getAdminProducts();
    const existing = products.find((product) => product.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const sizeStock = body.sizeStock ?? existing.sizeStock;
    const quantity =
      body.quantity ??
      sizeStock.S + sizeStock.M + sizeStock.L + sizeStock.XL;

    const product: Product = {
      ...existing,
      ...body,
      id,
      sizes: ["S", "M", "L", "XL"],
      sizeStock,
      quantity,
      price: body.price != null ? Number(body.price) : existing.price,
      mrp: body.mrp != null ? Number(body.mrp) : existing.mrp,
    };

    const updated = await updateProduct(id, product);
    return NextResponse.json({ product: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await deactivateProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
