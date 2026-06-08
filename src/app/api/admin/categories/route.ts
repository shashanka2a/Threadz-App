import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { createCategory } from "@/lib/db/categories";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as { name?: string; description?: string };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await createCategory({
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
    });

    return NextResponse.json({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
