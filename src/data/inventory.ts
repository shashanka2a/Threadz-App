export interface InventoryItem {
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
    quality: "55% cotton 45% polyester 180 GSM",
    color: "Charcoal Melange",
    category: "T-Shirts",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 160,
    totalPrice: 3840,
    mrp: 899,
  },
  {
    quality: "93% cotton 7% polyester 180 GSM",
    color: "Grey Melange",
    category: "T-Shirts",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 160,
    totalPrice: 3840,
    mrp: 899,
  },
  {
    quality: "100% cotton 180 GSM",
    color: "Cream",
    category: "T-Shirts",
    sizes: { S: 9, M: 9, L: 9, XL: 9 },
    quantity: 36,
    pricePerUnit: 160,
    totalPrice: 5760,
    mrp: 899,
  },
  {
    quality: "100% cotton 180 GSM",
    color: "LT Green",
    category: "T-Shirts",
    sizes: { S: 9, M: 9, L: 9, XL: 9 },
    quantity: 36,
    pricePerUnit: 160,
    totalPrice: 5760,
    mrp: 899,
  },
  {
    quality: "100% cotton 180 GSM",
    color: "Plum",
    category: "T-Shirts",
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    pricePerUnit: 160,
    totalPrice: 4480,
    mrp: 899,
  },
  {
    quality: "100% cotton 180 GSM",
    color: "P.T Blue",
    category: "T-Shirts",
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    pricePerUnit: 160,
    totalPrice: 5120,
    mrp: 899,
  },
  {
    quality: "100% cotton 200 GSM",
    color: "Burgundy",
    category: "Polo Shirts",
    sizes: { S: 7, M: 7, L: 7, XL: 7 },
    quantity: 28,
    pricePerUnit: 175,
    totalPrice: 4900,
    mrp: 999,
  },
  {
    quality: "100% cotton 200 GSM",
    color: "Dusty Rose",
    category: "Polo Shirts",
    sizes: { S: 8, M: 8, L: 8, XL: 8 },
    quantity: 32,
    pricePerUnit: 175,
    totalPrice: 5600,
    mrp: 999,
  },
  {
    quality: "100% cotton 200 GSM",
    color: "Brown",
    category: "Polo Shirts",
    sizes: { S: 5, M: 5, L: 5, XL: 4 },
    quantity: 19,
    pricePerUnit: 175,
    totalPrice: 3325,
    mrp: 999,
  },
  {
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Steel Grey",
    category: "Heavy Jersey",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 219,
    totalPrice: 5256,
    mrp: 1299,
  },
  {
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Wild Ginger",
    category: "Heavy Jersey",
    sizes: { S: 6, M: 6, L: 6, XL: 5 },
    quantity: 23,
    pricePerUnit: 219,
    totalPrice: 5037,
    mrp: 1299,
  },
  {
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Moss Green",
    category: "Heavy Jersey",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 219,
    totalPrice: 5256,
    mrp: 1299,
  },
  {
    quality: "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
    color: "Park Petrol",
    category: "Heavy Jersey",
    sizes: { S: 6, M: 6, L: 6, XL: 6 },
    quantity: 24,
    pricePerUnit: 219,
    totalPrice: 5256,
    mrp: 1299,
  },
];
