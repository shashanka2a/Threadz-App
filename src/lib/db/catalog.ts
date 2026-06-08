import {
  getAdminCategories,
  getCategories,
  getShopCategoryNames,
} from "@/lib/db/categories";
import { getAdminProducts } from "@/lib/db/admin-products";
import { computeInventoryStats, mapProductToInventoryItem } from "@/lib/db/inventory";
import type { AdminCatalog } from "@/types/admin";

export async function getAdminCatalog(): Promise<AdminCatalog> {
  const [products, categoryRows] = await Promise.all([getAdminProducts(), getCategories()]);

  const categories = await getAdminCategories(products);
  const inventory = products.map(mapProductToInventoryItem);
  const stats = computeInventoryStats(inventory);
  const shopCategories = getShopCategoryNames(categoryRows);

  return {
    products,
    categories,
    inventory,
    stats,
    shopCategories,
  };
}
