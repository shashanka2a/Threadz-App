import { Product } from "../types/product";
import { PRODUCT_CATEGORIES, SHOP_CATEGORIES } from "./categories";
import { inventoryData } from "./inventory";

const PRODUCT_IMAGES = {
  charcoal:
    "https://raw.githubusercontent.com/shashanka2a/Threadz-App/refs/heads/main/assets/charcoal.png",
  grey:
    "https://raw.githubusercontent.com/shashanka2a/Threadz-App/refs/heads/main/assets/grey.png",
} as const;

const images: Record<string, string> = {
  "Charcoal Melange": PRODUCT_IMAGES.charcoal,
  "Grey Melange": PRODUCT_IMAGES.grey,
  Cream:
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "LT Green":
    "https://images.unsplash.com/photo-1680292783974-a9a336c10366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  Plum:
    "https://images.unsplash.com/photo-1601056639638-c53c50e13ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "P.T Blue":
    "https://images.unsplash.com/photo-1613461920867-9ea115fee900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  Burgundy:
    "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Dusty Rose":
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  Brown:
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Steel Grey":
    "https://images.unsplash.com/photo-1680292783974-a9a336c10366?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Wild Ginger":
    "https://images.unsplash.com/photo-1601056639638-c53c50e13ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Moss Green":
    "https://images.unsplash.com/photo-1613461920867-9ea115fee900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Park Petrol":
    "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  Pink:
    "https://images.unsplash.com/photo-1601056639638-c53c50e13ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
};

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

export const products: Product[] = inventoryData.map((item) => ({
  id: item.id,
  name: buildName(item.color, item.category),
  description: buildDescription(item.quality, item.color, item.category),
  quality: item.quality,
  color: item.color,
  price: item.pricePerUnit,
  mrp: item.mrp,
  image: images[item.color],
  category: item.category as Product["category"],
  gsm: extractGsm(item.quality),
  sizes: ["S", "M", "L", "XL"],
  quantity: item.quantity,
  sizeStock: item.sizes,
}));

export const categories = [...SHOP_CATEGORIES];

export const colors = products.map((p) => p.color);

export function getProductsByQuality(quality: string): Product[] {
  return products.filter((p) => p.quality === quality);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getStockStatus(count: number): "in-stock" | "low-stock" | "out-of-stock" {
  if (count === 0) return "out-of-stock";
  if (count < 5) return "low-stock";
  return "in-stock";
}
