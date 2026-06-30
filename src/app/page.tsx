import HomeContent from "@/app/home-content";
import { getProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  return <HomeContent products={products} />;
}
