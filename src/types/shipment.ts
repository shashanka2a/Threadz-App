export type PincodeServiceability = {
  pincode: string;
  serviceable: boolean;
  prepaid: boolean;
  cod: boolean;
  reversePickup: boolean;
  city?: string;
  state?: string;
  message?: string;
};

export type ShippingEstimate = {
  pincode: string;
  weightGrams: number;
  estimatedCost: number;
  currency: string;
  billingMode: string;
  note?: string;
};

export type ShipmentRecord = {
  id: string;
  orderId: string;
  waybill: string | null;
  delhiveryStatus: string;
  paymentMode: string;
  shippingCost: number | null;
  weightGrams: number;
  labelData: Record<string, unknown> | null;
  trackingStatus: string | null;
  trackingData: Record<string, unknown> | null;
  pickupLocation: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrackingScan = {
  status: string;
  location?: string;
  timestamp?: string;
  instructions?: string;
};

export type TrackingResult = {
  waybill: string;
  status: string;
  scans: TrackingScan[];
  raw?: unknown;
};
