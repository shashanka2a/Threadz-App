import { getCategoryFromQuality } from "./categories";

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

export const inventoryData: InventoryItem[] = [
  {
    id: "1",
    quality: "55% cotton 45% polyester 180 GSM",
    color: "Charcoal Melange",
    category: getCategoryFromQuality("55% cotton 45% polyester 180 GSM"),
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    pricePerUnit: 160,
    totalPrice: 5120,
    mrp: 899,
  },
  {
    id: "2",
    quality: "93% cotton 7% polyester 180 GSM",
    color: "Grey Melange",
    category: getCategoryFromQuality("93% cotton 7% polyester 180 GSM"),
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 160,
    totalPrice: 3840,
    mrp: 899,
  },
  {
    id: "3",
    quality: "100% cotton 180 GSM",
    color: "Cream",
    category: getCategoryFromQuality("100% cotton 180 GSM"),
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    pricePerUnit: 160,
    totalPrice: 4480,
    mrp: 899,
  },
  {
    id: "4",
    quality: "100% cotton 180 GSM",
    color: "LT Green",
    category: getCategoryFromQuality("100% cotton 180 GSM"),
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    pricePerUnit: 160,
    totalPrice: 4480,
    mrp: 899,
  },
  {
    id: "5",
    quality: "100% cotton 180 GSM",
    color: "Plum",
    category: getCategoryFromQuality("100% cotton 180 GSM"),
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    pricePerUnit: 160,
    totalPrice: 4480,
    mrp: 899,
  },
  {
    id: "6",
    quality: "100% cotton 180 GSM",
    color: "P.T Blue",
    category: getCategoryFromQuality("100% cotton 180 GSM"),
    sizes: { S: 9, M: 9, L: 9, XL: 9 },
    quantity: 36,
    pricePerUnit: 160,
    totalPrice: 5760,
    mrp: 899,
  },
  {
    id: "7",
    quality: "100% cotton 200 GSM",
    color: "Burgundy",
    category: getCategoryFromQuality("100% cotton 200 GSM"),
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    pricePerUnit: 175,
    totalPrice: 4900,
    mrp: 999,
  },
  {
    id: "8",
    quality: "100% cotton 200 GSM",
    color: "Dusty Rose",
    category: getCategoryFromQuality("100% cotton 200 GSM"),
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    pricePerUnit: 175,
    totalPrice: 5600,
    mrp: 999,
  },
  {
    id: "9",
    quality: "100% cotton 200 GSM",
    color: "Brown",
    category: getCategoryFromQuality("100% cotton 200 GSM"),
    sizes: { S: 4, M: 5, L: 5, XL: 5 },
    quantity: 19,
    pricePerUnit: 175,
    totalPrice: 3325,
    mrp: 999,
  },
  {
    id: "10",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Steel Grey",
    category: getCategoryFromQuality("OVERSIZED 100% cotton Heavy Jersey 220 GSM"),
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 219,
    totalPrice: 5256,
    mrp: 1299,
  },
  {
    id: "11",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Wild Ginger",
    category: getCategoryFromQuality("OVERSIZED 100% cotton Heavy Jersey 220 GSM"),
    sizes: { S: 5, M: 6, L: 6, XL: 6 },
    quantity: 23,
    pricePerUnit: 219,
    totalPrice: 5037,
    mrp: 1299,
  },
  {
    id: "12",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Moss Green",
    category: getCategoryFromQuality("OVERSIZED 100% cotton Heavy Jersey 220 GSM"),
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 219,
    totalPrice: 5256,
    mrp: 1299,
  },
  {
    id: "13",
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Park Petrol",
    category: getCategoryFromQuality("OVERSIZED 100% cotton Heavy Jersey 220 GSM"),
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 219,
    totalPrice: 5256,
    mrp: 1299,
  },
  {
    id: "14",
    quality: "100% cotton Interlock 220 GSM",
    color: "Pink",
    category: getCategoryFromQuality("100% cotton Interlock 220 GSM"),
    sizes: { S: 12, M: 12, L: 12, XL: 11 },
    quantity: 47,
    pricePerUnit: 190,
    totalPrice: 8930,
    mrp: 1199,
  },
];

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
