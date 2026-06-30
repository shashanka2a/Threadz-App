import type { Product, SizeStock } from "@/types/product";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

type StockFields = Pick<Product, "quantity" | "sizeStock">;

export function getStockStatus(count: number): StockStatus {
  if (count <= 0) return "out-of-stock";
  if (count < 5) return "low-stock";
  return "in-stock";
}

export function getSizeStock(product: Product, size: string): number {
  const key = size as keyof SizeStock;
  return product.sizeStock[key] ?? 0;
}

export function isProductSoldOut(product: StockFields): boolean {
  return (
    product.quantity <= 0 ||
    Object.values(product.sizeStock).every((count) => count <= 0)
  );
}

export function hasLowStock(product: StockFields): boolean {
  return !isProductSoldOut(product) && product.quantity > 0 && product.quantity < 25;
}

export function maxAddableQuantity(
  product: Product,
  size: string,
  alreadyInCart = 0
): number {
  return Math.max(0, getSizeStock(product, size) - alreadyInCart);
}

export function canAddToCart(
  product: Product,
  size: string,
  quantity: number,
  alreadyInCart = 0
): { ok: true } | { ok: false; message: string } {
  if (!size) {
    return { ok: false, message: "Please select a size" };
  }

  const available = getSizeStock(product, size);
  if (available <= 0) {
    return { ok: false, message: `Size ${size} is out of stock` };
  }

  if (alreadyInCart + quantity > available) {
    return {
      ok: false,
      message: `Only ${available} left in size ${size}`,
    };
  }

  return { ok: true };
}
