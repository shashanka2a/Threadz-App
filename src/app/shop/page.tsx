import { Suspense } from "react";
import ShopContent from "./shop-content";
import { getProducts } from "@/lib/db/products";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">Loading shop...</div>
      }
    >
      <ShopContent products={products} />
    </Suspense>
  );
}
