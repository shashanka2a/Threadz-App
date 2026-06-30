import type {
  PincodeServiceability,
  ShippingEstimate,
  TrackingResult,
  TrackingScan,
} from "@/types/shipment";

const BASE_URL =
  process.env.DELHIVERY_API_BASE_URL ?? "https://track.delhivery.com";

function getToken(): string | null {
  return process.env.DELHIVERY_API_TOKEN?.trim() || null;
}

function isMockMode(): boolean {
  return !getToken() || process.env.DELHIVERY_MOCK === "true";
}

function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) throw new Error("DELHIVERY_API_TOKEN is not configured");
  return {
    Authorization: `Token ${token}`,
    Accept: "application/json",
  };
}

async function delhiveryFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

function normalizePincode(pin: string): string {
  return pin.replace(/\D/g, "").slice(0, 6);
}

function mockPincode(pin: string): PincodeServiceability {
  const serviceable = !/^9/.test(pin);
  return {
    pincode: pin,
    serviceable,
    prepaid: serviceable,
    cod: serviceable,
    reversePickup: serviceable,
    city: serviceable ? "Sample City" : undefined,
    state: serviceable ? "Sample State" : undefined,
    message: serviceable
      ? "Delivery available (mock mode — set DELHIVERY_API_TOKEN for live checks)"
      : "Pincode not serviceable (mock)",
  };
}

export async function checkPincodeServiceability(
  pincode: string
): Promise<PincodeServiceability> {
  const pin = normalizePincode(pincode);
  if (pin.length !== 6) {
    return {
      pincode: pin,
      serviceable: false,
      prepaid: false,
      cod: false,
      reversePickup: false,
      message: "Enter a valid 6-digit pincode",
    };
  }

  if (isMockMode()) return mockPincode(pin);

  const res = await delhiveryFetch(
    `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pin)}`
  );
  const data = (await res.json()) as {
    delivery_codes?: Array<{
      postal_code?: { pin?: string; city?: string; state_code?: string };
      pre_paid?: string;
      cod?: string;
      reverse_pickup?: string;
      remarks?: string;
    }>;
  };

  const entry = data.delivery_codes?.[0];
  if (!entry?.postal_code?.pin) {
    return {
      pincode: pin,
      serviceable: false,
      prepaid: false,
      cod: false,
      reversePickup: false,
      message: "Pincode not serviceable by Delhivery",
    };
  }

  const prepaid = entry.pre_paid === "Y";
  const cod = entry.cod === "Y";
  const reversePickup = entry.reverse_pickup === "Y";

  return {
    pincode: pin,
    serviceable: prepaid || cod,
    prepaid,
    cod,
    reversePickup,
    city: entry.postal_code.city,
    state: entry.postal_code.state_code,
    message: entry.remarks,
  };
}

export async function estimateShippingCost(params: {
  destinationPin: string;
  weightGrams: number;
  paymentMode?: "Prepaid" | "COD";
}): Promise<ShippingEstimate> {
  const dPin = normalizePincode(params.destinationPin);
  const oPin =
    normalizePincode(process.env.DELHIVERY_ORIGIN_PINCODE ?? "110001") ||
    "110001";
  const weight = Math.max(100, params.weightGrams);
  const ss = params.paymentMode === "COD" ? "COD" : "Prepaid";

  if (isMockMode()) {
    const base = 79;
    const per100g = Math.ceil(weight / 100) * 12;
    return {
      pincode: dPin,
      weightGrams: weight,
      estimatedCost: base + per100g,
      currency: "INR",
      billingMode: "E",
      note: "Mock estimate — configure DELHIVERY_API_TOKEN for live rates",
    };
  }

  const qs = new URLSearchParams({
    md: "E",
    cgm: String(weight),
    o_pin: oPin,
    d_pin: dPin,
    ss: "Delivered",
    pt: ss,
  });

  const res = await delhiveryFetch(
    `/api/kinko/v1/invoice/charges/.json/?${qs.toString()}`
  );
  const data = (await res.json()) as {
    total_amount?: number;
    gross_amount?: number;
    charge?: number;
  };

  const cost =
    data.total_amount ?? data.gross_amount ?? data.charge ?? 0;

  return {
    pincode: dPin,
    weightGrams: weight,
    estimatedCost: Number(cost) || 0,
    currency: "INR",
    billingMode: "E",
  };
}

export type CreateShipmentPayload = {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email?: string;
  totalAmount: number;
  weightGrams: number;
  paymentMode: "Prepaid" | "COD";
  productDescription: string;
  quantity: number;
};

export type CreateShipmentResult = {
  success: boolean;
  waybill?: string;
  uploadWbn?: string;
  status?: string;
  raw?: unknown;
  error?: string;
};

export async function createShipment(
  payload: CreateShipmentPayload
): Promise<CreateShipmentResult> {
  const pickupLocation =
    process.env.DELHIVERY_PICKUP_LOCATION?.trim() || "Primary";
  const clientName =
    process.env.DELHIVERY_CLIENT_NAME?.trim() || "THREADZ";
  const sellerGst =
    process.env.DELHIVERY_SELLER_GST_TIN?.trim() || "";
  const hsnCode = process.env.DELHIVERY_DEFAULT_HSN_CODE?.trim() || "6109";

  if (isMockMode()) {
    const mockWb = `MOCK${Date.now().toString().slice(-10)}`;
    return {
      success: true,
      waybill: mockWb,
      uploadWbn: mockWb,
      status: "Success",
      raw: { mock: true },
    };
  }

  const shipment = {
    name: payload.name.slice(0, 100),
    add: payload.address.slice(0, 200),
    pin: normalizePincode(payload.pincode),
    city: payload.city,
    state: payload.state,
    country: "India",
    phone: payload.phone.replace(/\D/g, "").slice(-10),
    order: payload.orderId,
    payment_mode: payload.paymentMode,
    return_pin: "",
    return_city: "",
    return_phone: "",
    return_add: "",
    return_state: "",
    return_country: "India",
    products_desc: payload.productDescription.slice(0, 200),
    hsn_code: hsnCode,
    cod_amount: payload.paymentMode === "COD" ? payload.totalAmount : 0,
    order_date: new Date().toISOString().slice(0, 10),
    total_amount: payload.totalAmount,
    seller_add: "",
    seller_name: clientName,
    seller_inv: payload.orderId,
    seller_cst: "",
    seller_tin: "",
    seller_gst_tin: sellerGst,
    quantity: payload.quantity,
    waybill: "",
    shipment_width: "",
    shipment_height: "",
    weight: String(Math.max(0.1, payload.weightGrams / 1000)),
    shipping_mode: "Surface",
    address_type: "home",
  };

  const body = new URLSearchParams({
    format: "json",
    data: JSON.stringify({
      shipments: [shipment],
      pickup_location: { name: pickupLocation },
    }),
  });

  const res = await delhiveryFetch("/api/cmu/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = (await res.json()) as {
    success?: boolean;
    packages?: Array<{ waybill?: string; status?: string; remarks?: string[] }>;
    rmk?: string;
    error?: string;
  };

  const pkg = data.packages?.[0];
  if (!data.success && !pkg?.waybill) {
    return {
      success: false,
      error: data.rmk || data.error || pkg?.remarks?.join(", ") || "Create failed",
      raw: data,
    };
  }

  return {
    success: true,
    waybill: pkg?.waybill,
    uploadWbn: pkg?.waybill,
    status: pkg?.status,
    raw: data,
  };
}

export async function updateShipment(params: {
  waybill: string;
  name?: string;
  phone?: string;
  address?: string;
  pincode?: string;
}): Promise<{ success: boolean; raw?: unknown; error?: string }> {
  if (isMockMode()) {
    return { success: true, raw: { mock: true } };
  }

  const body = new URLSearchParams({
    format: "json",
    data: JSON.stringify({
      waybill: params.waybill,
      name: params.name,
      phone: params.phone,
      add: params.address,
      pin: params.pincode ? normalizePincode(params.pincode) : undefined,
    }),
  });

  const res = await delhiveryFetch("/api/p/edit", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  const ok = (data as { success?: boolean }).success !== false;
  return { success: ok, raw: data, error: ok ? undefined : "Update failed" };
}

export async function cancelShipment(
  waybill: string
): Promise<{ success: boolean; raw?: unknown; error?: string }> {
  if (isMockMode()) {
    return { success: true, raw: { mock: true, cancelled: true } };
  }

  const body = new URLSearchParams({
    format: "json",
    data: JSON.stringify({
      waybill,
      cancellation: "true",
    }),
  });

  const res = await delhiveryFetch("/api/p/edit", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  const ok = (data as { success?: boolean }).success !== false;
  return { success: ok, raw: data, error: ok ? undefined : "Cancel failed" };
}

export async function trackShipment(waybill: string): Promise<TrackingResult> {
  if (isMockMode()) {
    return {
      waybill,
      status: "In Transit",
      scans: [
        {
          status: "Shipment picked up",
          location: "Origin hub",
          timestamp: new Date().toISOString(),
        },
        {
          status: "In transit",
          location: "Destination city",
          timestamp: new Date().toISOString(),
        },
      ],
      raw: { mock: true },
    };
  }

  const res = await delhiveryFetch(
    `/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`
  );
  const data = (await res.json()) as {
    ShipmentData?: Array<{
      Shipment?: {
        Status?: { Status?: string; Instructions?: string };
        Scans?: Array<{
          ScanDetail?: {
            Scan?: string;
            ScannedLocation?: string;
            StatusDateTime?: string;
            Instructions?: string;
          };
        }>;
      };
    }>;
  };

  const shipment = data.ShipmentData?.[0]?.Shipment;
  const scans: TrackingScan[] =
    shipment?.Scans?.map((s) => ({
      status: s.ScanDetail?.Scan ?? "Update",
      location: s.ScanDetail?.ScannedLocation,
      timestamp: s.ScanDetail?.StatusDateTime,
      instructions: s.ScanDetail?.Instructions,
    })) ?? [];

  return {
    waybill,
    status: shipment?.Status?.Status ?? "Unknown",
    scans,
    raw: data,
  };
}

export async function fetchPackingSlip(waybill: string): Promise<{
  success: boolean;
  labelUrl?: string;
  packages?: unknown[];
  raw?: unknown;
  error?: string;
}> {
  if (isMockMode()) {
    return {
      success: true,
      labelUrl: undefined,
      packages: [{ waybill, mock: true }],
      raw: { mock: true },
    };
  }

  const res = await delhiveryFetch(
    `/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}`
  );
  const data = (await res.json()) as {
    packages?: Array<{ wbn?: string; pdf?: string; pdf_download_link?: string }>;
    error?: string;
  };

  const pkg = data.packages?.[0];
  const labelUrl = pkg?.pdf_download_link ?? pkg?.pdf;

  return {
    success: Boolean(labelUrl || data.packages?.length),
    labelUrl,
    packages: data.packages,
    raw: data,
    error: labelUrl ? undefined : data.error ?? "Label not available",
  };
}

export function estimateOrderWeightGrams(itemCount: number): number {
  const perItem = 250;
  return Math.max(250, itemCount * perItem);
}

export function delhiveryConfigured(): boolean {
  return !isMockMode();
}
