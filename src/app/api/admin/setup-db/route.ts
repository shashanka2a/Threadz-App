import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import pg from "pg";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function POST() {
  try {
    await requireAdminSession();

    const connectionString = process.env.SUPABASE_DB_URL;
    if (!connectionString) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_DB_URL is not configured. Add your Postgres connection string to .env.local.",
        },
        { status: 500 },
      );
    }

    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    for (const file of ["schema.sql", "seed.sql"]) {
      const sql = readFileSync(join(process.cwd(), "supabase", file), "utf8");
      await client.query(sql);
    }

    const { rows } = await client.query(`
      select
        (select count(*)::int from public.categories) as categories,
        (select count(*)::int from public.products) as products
    `);

    await client.end();

    return NextResponse.json({
      success: true,
      categories: rows[0].categories,
      products: rows[0].products,
      message: "Database schema and seed applied",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database setup failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
