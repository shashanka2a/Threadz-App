import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapProductRow, mapProductToUpdate, mapProductToUpsert } from "@/lib/db/mappers";
import type { Product } from "@/types/product";

export async function getAdminProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProductRow);
}

async function getAllProductIds(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("id");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.id);
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
  const row = mapProductToUpdate(product);

  const { data, error } = await supabase
    .from("products")
    .update(row)
    .eq("id", id)
    .eq("is_active", true)
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
  const ids = await getAllProductIds();
  const maxId = ids.reduce((max, id) => {
    const numeric = parseInt(id, 10);
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return String(maxId + 1);
}
