import { getCategoryFromQuality, getRetailPrice } from "./categories";

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

type InventorySeed = Omit<InventoryItem, "pricePerUnit" | "totalPrice" | "category"> & {
  category?: string;
};

const inventorySeed: InventorySeed[] = [
  {
    id: "1",
    quality: "55% cotton 45% polyester 180 GSM",
    color: "Charcoal Melange",
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    mrp: 899,
  },
  {
    id: "2",
    quality: "93% cotton 7% polyester 180 GSM",
    color: "Grey Melange",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    mrp: 899,
  },
  {
    id: "3",
    quality: "100% cotton 180 GSM",
    color: "Cream",
    sizes: { S: 9, M: 9, L: 9, XL: 9 },
    quantity: 36,
    mrp: 899,
  },
  {
    id: "4",
    quality: "100% cotton 180 GSM",
    color: "LT Green",
    sizes: { S: 9, M: 9, L: 9, XL: 9 },
    quantity: 36,
    mrp: 899,
  },
  {
    id: "5",
    quality: "100% cotton 180 GSM",
    color: "Plum",
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    mrp: 899,
  },
  {
    id: "6",
    quality: "100% cotton 180 GSM",
    color: "P.T Blue",
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    mrp: 899,
  },
  {
    id: "7",
    quality: "100% cotton 200 GSM",
    color: "Burgundy",
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    mrp: 999,
  },
  {
    id: "8",
    quality: "100% cotton 200 GSM",
    color: "Dusty Rose",
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    mrp: 999,
  },
  {
    id: "9",
    quality: "100% cotton 200 GSM",
    color: "Brown",
    sizes: { S: 5, M: 5, L: 4, XL: 5 },
    quantity: 19,
    mrp: 999,
  },
  {
    id: "10",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Steel Grey",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    mrp: 1299,
  },
  {
    id: "11",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Wild Ginger",
    sizes: { S: 5, M: 6, L: 6, XL: 6 },
    quantity: 23,
    mrp: 1299,
  },
  {
    id: "12",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Moss Green",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    mrp: 1299,
  },
  {
    id: "13",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Park Petrol",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    mrp: 1299,
  },
  {
    id: "14",
    quality: "100% cotton Interlock 220 GSM",
    color: "Pink",
    sizes: { S: 12, M: 12, L: 12, XL: 11 },
    quantity: 47,
    mrp: 1199,
  },
];

export const inventoryData: InventoryItem[] = inventorySeed.map((item) => {
  const pricePerUnit = getRetailPrice(item.quality);
  return {
    ...item,
    category: item.category ?? getCategoryFromQuality(item.quality),
    pricePerUnit,
    totalPrice: item.quantity * pricePerUnit,
  };
});

export function getInventoryByProductId(productId: string): InventoryItem | undefined {
  return inventoryData.find((item) => item.id === productId);
}

export function getInventoryStats() {
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.totalPrice, 0);
  const lowStockItems = inventoryData.filter((item) => item.quantity < 25);

  const categoryStats = inventoryData.reduce<
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
