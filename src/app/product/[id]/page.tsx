import { notFound } from "next/navigation";
import ProductDetailContent from "./product-detail-content";
import { getProductById, getProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, allProducts] = await Promise.all([getProductById(id), getProducts()]);

  if (!product) {
    notFound();
  }

  return <ProductDetailContent product={product} allProducts={allProducts} />;
}
