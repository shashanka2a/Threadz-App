import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapProductRow } from "@/lib/db/mappers";
import { staticProducts } from "@/data/products";
import type { Product } from "@/types/product";

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    return staticProducts;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProducts]", error.message);
    return staticProducts;
  }

  if (!data?.length) {
    return staticProducts;
  }

  return data.map(mapProductRow);
});

export const getProductById = cache(async (id: string): Promise<Product | undefined> => {
  if (!isSupabaseConfigured()) {
    return staticProducts.find((product) => product.id === id);
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getProductById]", error.message);
    return staticProducts.find((product) => product.id === id);
  }

  if (!data) {
    return staticProducts.find((product) => product.id === id);
  }

  return mapProductRow(data);
});

