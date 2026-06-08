import { Suspense } from "react";
import ShopContent from "./shop-content";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">Loading shop...</div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
