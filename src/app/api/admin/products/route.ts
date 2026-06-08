import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { createProduct, getNextProductId } from "@/lib/db/admin-products";
import type { Product } from "@/types/product";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as Partial<Product>;

    if (!body.name || !body.category || body.price == null) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const sizeStock = body.sizeStock ?? { S: 0, M: 0, L: 0, XL: 0 };
    const quantity =
      body.quantity ??
      sizeStock.S + sizeStock.M + sizeStock.L + sizeStock.XL;

    const product: Product = {
      id: body.id ?? (await getNextProductId()),
      name: body.name,
      description: body.description ?? "",
      quality: body.quality ?? "",
      color: body.color ?? "",
      price: Number(body.price),
      mrp: Number(body.mrp ?? body.price),
      image: body.image ?? "",
      category: body.category,
      gsm: body.gsm ?? "",
      sizes: ["S", "M", "L", "XL"],
      quantity,
      sizeStock,
    };

    const created = await createProduct(product);
    return NextResponse.json({ product: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
