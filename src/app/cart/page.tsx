import CartContent from "@/app/cart/cart-content";
import { getProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const liveProducts = await getProducts();
  return <CartContent liveProducts={liveProducts} />;
}
