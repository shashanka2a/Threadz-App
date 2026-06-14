import { Product } from "../types/product";
import { PRODUCT_CATEGORIES, SHOP_CATEGORIES } from "./categories";
import { inventoryData } from "./inventory";
import { getProductImageUrl } from "./product-images";

function extractGsm(quality: string): string {
  const match = quality.match(/(\d+)\s*GSM/i);
  return match ? `${match[1]} GSM` : "";
}

function buildDescription(quality: string, color: string, category: string): string {
  if (category === PRODUCT_CATEGORIES.OVERSIZED) {
    return `${color} oversized tee in heavy jersey cotton with a relaxed streetwear fit.`;
  }
  if (quality.includes("Interlock")) {
    return `${color} plain tee in soft interlock cotton for a smooth, structured feel.`;
  }
  if (quality.includes("200 GSM")) {
    return `${color} plain tee in heavier 200 GSM cotton for extra durability.`;
  }
  if (quality.includes("55% cotton")) {
    return `${color} plain tee in a breathable cotton-poly blend for everyday wear.`;
  }
  return `${color} plain tee in premium cotton for all-day comfort.`;
}

function buildName(color: string, category: string): string {
  return category === PRODUCT_CATEGORIES.OVERSIZED
    ? `${color} Oversized Tee`
    : `${color} Plain Tee`;
}

export const staticProducts: Product[] = inventoryData.map((item) => ({
  id: item.id,
  name: buildName(item.color, item.category),
  description: buildDescription(item.quality, item.color, item.category),
  quality: item.quality,
  color: item.color,
  price: item.pricePerUnit,
  mrp: item.mrp,
  image: getProductImageUrl(item.color),
  category: item.category as Product["category"],
  gsm: extractGsm(item.quality),
  sizes: ["S", "M", "L", "XL"],
  quantity: item.quantity,
  sizeStock: item.sizes,
}));

/** Static catalog fallback when Supabase is unavailable or empty. */
export const products = staticProducts;

export const categories = [...SHOP_CATEGORIES];

export const colors = staticProducts.map((p) => p.color);

export function getProductsByQuality(quality: string): Product[] {
  return staticProducts.filter((p) => p.quality === quality);
}

export function getProductsByCategory(category: string): Product[] {
  return staticProducts.filter((p) => p.category === category);
}

export function getStockStatus(count: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (count === 0) return "out-of-stock";
  if (count < 5) return "low-stock";
  return "in-stock";
}
