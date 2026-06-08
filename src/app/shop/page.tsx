import { Suspense } from "react";
import ShopContent from "./shop-content";
import { getCategories, getShopCategoryNames } from "@/lib/db/categories";
import { getProducts } from "@/lib/db/products";

export default async function ShopPage() {
  const [products, categoryRows] = await Promise.all([getProducts(), getCategories()]);
  const shopCategories = getShopCategoryNames(categoryRows);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">Loading shop...</div>
      }
    >
      <ShopContent products={products} shopCategories={shopCategories} />
    </Suspense>
  );
}
