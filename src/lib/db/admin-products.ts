import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapProductRow, mapProductToUpsert } from "@/lib/db/mappers";
import type { Product } from "@/types/product";

export async function getAdminProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProductRow);
}

export async function createProduct(product: Product): Promise<Product> {
  const supabase = createAdminClient();
  const row = mapProductToUpsert(product);

  const { data, error } = await supabase.from("products").insert(row).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProductRow(data);
}

export async function updateProduct(id: string, product: Product): Promise<Product> {
  const supabase = createAdminClient();
  const row = mapProductToUpsert(product);

  const { id: _productId, ...updateRow } = row;

  const { data, error } = await supabase
    .from("products")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProductRow(data);
}

export async function deactivateProduct(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextProductId(): Promise<string> {
  const products = await getAdminProducts();
  const maxId = products.reduce((max, product) => {
    const numeric = parseInt(product.id, 10);
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return String(maxId + 1);
}
