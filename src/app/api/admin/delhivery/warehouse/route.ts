import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import {
  createWarehouse,
  getWarehouseConfigFromEnv,
  registerWarehouse,
  updateWarehouse,
} from "@/lib/delhivery";

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({
      configured: getWarehouseConfigFromEnv(),
      note: "POST to sync this warehouse with Delhivery (create or update).",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json().catch(() => ({}))) as {
      action?: "register" | "create" | "update";
    };

    const action = body.action ?? "register";
    const result =
      action === "create"
        ? await createWarehouse()
        : action === "update"
          ? await updateWarehouse()
          : await registerWarehouse();

    if (!result.success) {
      return NextResponse.json({ error: result.error, result }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Warehouse sync failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
