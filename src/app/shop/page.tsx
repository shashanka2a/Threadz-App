import { Suspense } from "react";
import ShopContent from "./shop-content";
import ShopLoading from "./loading";
import { getCategories, getShopCategoryNames } from "@/lib/db/categories";
import { getProducts } from "@/lib/db/products";

export const revalidate = 60;

export default async function ShopPage() {
  const [products, categoryRows] = await Promise.all([getProducts(), getCategories()]);
  const shopCategories = getShopCategoryNames(categoryRows);

  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent products={products} shopCategories={shopCategories} />
    </Suspense>
  );
}

