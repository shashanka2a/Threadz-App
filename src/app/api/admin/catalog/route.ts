import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminCatalog } from "@/lib/db/catalog";

export async function GET() {
  try {
    await requireAdminSession();
    const catalog = await getAdminCatalog();
    return NextResponse.json(catalog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load catalog";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
