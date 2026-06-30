import type { ProductRow, ProductInsert } from "@/lib/supabase/database.types";
import type { Product, SizeStock } from "@/types/product";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/data/categories";

function getCategoryId(category: string): string {
  return category === PRODUCT_CATEGORIES.OVERSIZED ? "oversized" : "plain";
}

export function mapProductRow(row: ProductRow): Product {
  const sizeStock: SizeStock = {
    S: row.size_s,
    M: row.size_m,
    L: row.size_l,
    XL: row.size_xl,
  };

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    quality: row.quality,
    color: row.color,
    price: Number(row.price),
    mrp: Number(row.mrp),
    image: row.image,
    category: row.category as ProductCategory,
    gsm: row.gsm,
    sizes: ["S", "M", "L", "XL"],
    quantity: row.quantity,
    sizeStock,
  };
}

export function mapProductToRow(product: Product): ProductRow {
  const now = new Date().toISOString();
  return {
    id: product.id,
    category_id: getCategoryId(product.category),
    name: product.name,
    description: product.description,
    quality: product.quality,
    color: product.color,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    category: product.category,
    gsm: product.gsm,
    size_s: product.sizeStock.S,
    size_m: product.sizeStock.M,
    size_l: product.sizeStock.L,
    size_xl: product.sizeStock.XL,
    quantity: product.quantity,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
}

export function mapProductToUpsert(product: Product): ProductInsert {
  return {
    id: product.id,
    category_id: getCategoryId(product.category),
    name: product.name,
    description: product.description,
    quality: product.quality,
    color: product.color,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    category: product.category,
    gsm: product.gsm,
    size_s: product.sizeStock.S,
    size_m: product.sizeStock.M,
    size_l: product.sizeStock.L,
    size_xl: product.sizeStock.XL,
    quantity: product.quantity,
    is_active: true,
  };
}

export function mapProductToUpdate(product: Product) {
  return {
    category_id: getCategoryId(product.category),
    name: product.name,
    description: product.description,
    quality: product.quality,
    color: product.color,
    price: product.price,
    mrp: product.mrp,
    image: product.image,
    category: product.category,
    gsm: product.gsm,
    size_s: product.sizeStock.S,
    size_m: product.sizeStock.M,
    size_l: product.sizeStock.L,
    size_xl: product.sizeStock.XL,
    quantity: product.quantity,
  };
}
