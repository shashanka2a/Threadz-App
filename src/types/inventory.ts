export interface InventoryItem {
  id: string;
  quality: string;
  color: string;
  category: string;
  sizes: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  mrp: number;
}

export type InventoryStats = {
  totalQuantity: number;
  totalInventoryValue: number;
  lowStockItems: InventoryItem[];
  lowStockCount: number;
  categoryStats: Record<string, { products: number; stock: number; value: number }>;
  avgPrice: number;
};
