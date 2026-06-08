import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CategoryRow } from "@/lib/supabase/database.types";

export type AdminCategory = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  productCount: number;
};

export async function getCategories(): Promise<CategoryRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export function getShopCategoryNames(categories: CategoryRow[]): string[] {
  return ["All Products", ...categories.map((category) => category.name)];
}

export async function getAdminCategories(products: { category: string }[]): Promise<AdminCategory[]> {
  const categories = await getCategories();
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    sortOrder: category.sort_order,
    productCount: products.filter((product) => product.category === category.name).length,
  }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createCategory(input: {
  name: string;
  description: string;
}): Promise<CategoryRow> {
  const supabase = createAdminClient();
  const id = slugify(input.name);

  const { data, error } = await supabase
    .from("categories")
    .insert({
      id,
      name: input.name,
      description: input.description,
      sort_order: 99,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCategory(
  id: string,
  input: { name?: string; description?: string },
): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      description: input.description,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (input.name && input.name !== existing.name) {
    const { error: productError } = await supabase
      .from("products")
      .update({ category: input.name })
      .eq("category_id", id);

    if (productError) {
      throw new Error(productError.message);
    }
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Cannot delete category with existing products");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
