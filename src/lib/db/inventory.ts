import type { InventoryItem, InventoryStats } from "@/types/inventory";
import type { Product } from "@/types/product";

export function mapProductToInventoryItem(product: Product): InventoryItem {
  return {
    id: product.id,
    quality: product.quality,
    color: product.color,
    category: product.category,
    sizes: { ...product.sizeStock },
    quantity: product.quantity,
    pricePerUnit: product.price,
    totalPrice: product.quantity * product.price,
    mrp: product.mrp,
  };
}

export function computeInventoryStats(items: InventoryItem[]): InventoryStats {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalInventoryValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const lowStockItems = items.filter((item) => item.quantity < 25);

  const categoryStats = items.reduce<
    Record<string, { products: number; stock: number; value: number }>
  >((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { products: 0, stock: 0, value: 0 };
    }
    acc[item.category].products += 1;
    acc[item.category].stock += item.quantity;
    acc[item.category].value += item.totalPrice;
    return acc;
  }, {});

  return {
    totalQuantity,
    totalInventoryValue,
    lowStockItems,
    lowStockCount: lowStockItems.length,
    categoryStats,
    avgPrice: totalQuantity > 0 ? totalInventoryValue / totalQuantity : 0,
  };
}
