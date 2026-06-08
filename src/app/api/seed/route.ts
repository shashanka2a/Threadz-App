import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { staticProducts } from "@/data/products";
import { mapProductToUpsert } from "@/lib/db/mappers";

/** POST /api/seed — upserts the static catalog into Supabase (run once after schema.sql). */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  try {
    const supabase = createPublicClient();
    const rows = staticProducts.map(mapProductToUpsert);

    const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      message: `Seeded ${rows.length} products`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
