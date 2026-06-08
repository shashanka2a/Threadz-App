import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapProductRow } from "@/lib/db/mappers";
import { staticProducts } from "@/data/products";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return staticProducts;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data?.length) {
      console.warn("[getProducts] Supabase fallback:", error?.message ?? "empty table");
      return staticProducts;
    }

    return data.map(mapProductRow);
  } catch (error) {
    console.warn("[getProducts] Supabase error, using static data:", error);
    return staticProducts;
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.id === id);
}
