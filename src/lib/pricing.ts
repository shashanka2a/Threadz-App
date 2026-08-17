/** GST rate for apparel — prices on site are tax-inclusive. */
export const GST_RATE = 0.18;

/** Delhivery warehouse / origin pincode for delivery estimates. */
export const WAREHOUSE_PINCODE = "501401";

/** Bundle Offer constants */
export const BUNDLE_180_GSM_QTY = 3;
export const BUNDLE_180_GSM_PRICE = 999;
export const SINGLE_180_GSM_PRICE = 499;
export const SAVINGS_PER_180_GSM_BUNDLE = SINGLE_180_GSM_PRICE * BUNDLE_180_GSM_QTY - BUNDLE_180_GSM_PRICE; // 498

export type BundleOfferInfo = {
  /** Total qualifying 180 GSM items in cart */
  eligibleCount: number;
  /** Number of completed 3-packs */
  bundleCount: number;
  /** Items needed to unlock the next 3-for-999 tier (0 if none or just completed) */
  itemsNeededForNext: number;
  /** Total discount amount in INR */
  bundleDiscount: number;
  /** Progress percentage toward the next bundle (0 to 100) */
  progressPercentage: number;
  /** Whether at least one bundle is active */
  applied: boolean;
};

/** Checks whether a product or cart item qualifies for the 180 GSM bundle offer */
export function is180GsmItem(item: { gsm?: string; quality?: string; category?: string }): boolean {
  if (item.gsm && /180\s*GSM/i.test(item.gsm)) return true;
  if (item.quality && /180\s*GSM/i.test(item.quality) && !/heavy\s*jersey/i.test(item.quality)) return true;
  return false;
}

/** Computes the bundle discount and progress for a list of cart items */
export function computeBundleOffer(
  cartItems: Array<{ gsm?: string; quality?: string; category?: string; cartQuantity: number; price: number }>
): BundleOfferInfo {
  const eligibleCount = cartItems
    .filter(is180GsmItem)
    .reduce((sum, item) => sum + item.cartQuantity, 0);

  const bundleCount = Math.floor(eligibleCount / BUNDLE_180_GSM_QTY);
  const remainder = eligibleCount % BUNDLE_180_GSM_QTY;
  const itemsNeededForNext = remainder === 0 ? 0 : BUNDLE_180_GSM_QTY - remainder;
  const bundleDiscount = bundleCount * SAVINGS_PER_180_GSM_BUNDLE;
  const progressPercentage = remainder === 0 && bundleCount > 0 ? 100 : Math.round((remainder / BUNDLE_180_GSM_QTY) * 100);

  return {
    eligibleCount,
    bundleCount,
    itemsNeededForNext,
    bundleDiscount,
    progressPercentage,
    applied: bundleCount > 0,
  };
}

export type CheckoutTotals = {
  /** Amount the customer pays (products only; delivery promo applied). */
  total: number;
  /** GST portion included in product total. */
  tax: number;
  /** Pre-tax product base. */
  subtotal: number;
  /** Undiscounted raw sum of items (if bundle discount applied). */
  rawSubtotal: number;
  /** Bundle discount amount. */
  bundleDiscount: number;
  /** Delhivery quoted delivery fee (shown struck-through at checkout). */
  quotedDelivery: number;
  /** Delivery fee waived as a checkout discount. */
  deliveryDiscount: number;
};

/** Checkout totals — calculates effective total after bundle discount, then computes tax. */
export function computeCheckoutTotals(
  rawCartTotal: number,
  quotedDelivery = 0,
  bundleDiscount = 0,
): CheckoutTotals {
  const deliveryDiscount = Math.max(0, Math.round(quotedDelivery));
  const effectiveTotal = Math.max(0, rawCartTotal - bundleDiscount);
  const tax = Math.round((effectiveTotal * GST_RATE) / (1 + GST_RATE));
  const subtotal = effectiveTotal - tax;

  return {
    total: effectiveTotal,
    tax,
    subtotal,
    rawSubtotal: rawCartTotal,
    bundleDiscount,
    quotedDelivery: deliveryDiscount,
    deliveryDiscount,
  };
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

