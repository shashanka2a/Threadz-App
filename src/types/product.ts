import type { ProductCategory } from "@/data/categories";

export interface SizeStock {
  S: number;
  M: number;
  L: number;
  XL: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  quality: string;
  color: string;
  price: number;
  mrp: number;
  image: string;
  category: ProductCategory;
  gsm: string;
  sizes: string[];
  quantity: number;
  sizeStock: SizeStock;
}

export interface CartItem extends Product {
  selectedSize: string;
  cartQuantity: number;
}
