import CartContent from "@/app/cart/cart-content";
import { getProducts } from "@/lib/db/products";

export const revalidate = 60;

export default async function CartPage() {
  const liveProducts = await getProducts();
  return <CartContent liveProducts={liveProducts} />;
}
