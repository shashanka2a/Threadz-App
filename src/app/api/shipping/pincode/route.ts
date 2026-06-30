import { NextRequest, NextResponse } from "next/server";
import { checkPincodeServiceability } from "@/lib/delhivery";

export async function GET(request: NextRequest) {
  try {
    const pin = request.nextUrl.searchParams.get("pin") ?? "";
    const result = await checkPincodeServiceability(pin);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Pincode check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
