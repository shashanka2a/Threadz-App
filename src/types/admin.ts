import type { AdminCategory } from "@/lib/db/categories";
import type { InventoryItem, InventoryStats } from "@/types/inventory";
import type { Product } from "@/types/product";

export type AdminCatalog = {
  products: Product[];
  categories: AdminCategory[];
  inventory: InventoryItem[];
  stats: InventoryStats;
  shopCategories: string[];
};
