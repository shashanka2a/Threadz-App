/** GST rate for apparel — prices on site are tax-inclusive. */
export const GST_RATE = 0.18;

/** Delhivery warehouse / origin pincode for delivery estimates. */
export const WAREHOUSE_PINCODE = "501401";

export type CheckoutTotals = {
  /** Amount the customer pays (products only; delivery promo applied). */
  total: number;
  /** GST portion included in product total. */
  tax: number;
  /** Pre-tax product base. */
  subtotal: number;
  /** Delhivery quoted delivery fee (shown struck-through at checkout). */
  quotedDelivery: number;
  /** Delivery fee waived as a checkout discount. */
  deliveryDiscount: number;
};

/** Checkout totals — delivery is quoted then fully discounted (free shipping promo). */
export function computeCheckoutTotals(
  cartTotal: number,
  quotedDelivery = 0,
): CheckoutTotals {
  const deliveryDiscount = Math.max(0, Math.round(quotedDelivery));
  const total = cartTotal;
  const tax = Math.round((cartTotal * GST_RATE) / (1 + GST_RATE));
  const subtotal = cartTotal - tax;

  return {
    total,
    tax,
    subtotal,
    quotedDelivery: deliveryDiscount,
    deliveryDiscount,
  };
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
