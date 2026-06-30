import { Badge } from "@/components/ui/badge";
import { hasLowStock, isProductSoldOut } from "@/lib/stock";
import type { Product } from "@/types/product";

type ProductStockBadgeRowProps = {
  product: Pick<Product, "quantity" | "sizeStock">;
};

export function ProductStockBadgeRow({ product }: ProductStockBadgeRowProps) {
  const soldOut = isProductSoldOut(product);
  const lowStock = hasLowStock(product);

  if (soldOut) {
    return (
      <Badge className="rounded-none text-[10px] bg-neutral-800 text-white hover:bg-neutral-800">
        Out of Stock
      </Badge>
    );
  }

  if (lowStock) {
    return (
      <Badge className="rounded-none text-[10px] bg-yellow-400 text-black hover:bg-yellow-400">
        Low Stock
      </Badge>
    );
  }

  return null;
}
