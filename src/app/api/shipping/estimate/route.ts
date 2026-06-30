import { NextRequest, NextResponse } from "next/server";
import { estimateShippingCost } from "@/lib/delhivery";

export async function GET(request: NextRequest) {
  try {
    const pin = request.nextUrl.searchParams.get("pin") ?? "";
    const weight = Number(request.nextUrl.searchParams.get("weight") ?? "250");
    const paymentMode =
      request.nextUrl.searchParams.get("paymentMode") === "COD" ? "COD" : "Prepaid";

    const result = await estimateShippingCost({
      destinationPin: pin,
      weightGrams: weight,
      paymentMode,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Shipping estimate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
