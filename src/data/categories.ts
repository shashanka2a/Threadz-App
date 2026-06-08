export const PRODUCT_CATEGORIES = {
  PLAIN: "Plain T-Shirts",
  OVERSIZED: "Oversized T-Shirts",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

export const SHOP_CATEGORIES = [
  "All Products",
  PRODUCT_CATEGORIES.PLAIN,
  PRODUCT_CATEGORIES.OVERSIZED,
] as const;

export const QUALITY_OPTIONS = [
  "55% cotton 45% polyester 180 GSM",
  "93% cotton 7% polyester 180 GSM",
  "100% cotton 180 GSM",
  "100% cotton 200 GSM",
  "100% cotton Interlock 220 GSM",
  "OVERSIZED 100% cotton Heavy Jersey 220 GSM",
] as const;

export const CATEGORY_DESCRIPTIONS: Record<ProductCategory, string> = {
  [PRODUCT_CATEGORIES.PLAIN]: "Classic fit tees in premium cotton blends and interlock fabrics",
  [PRODUCT_CATEGORIES.OVERSIZED]: "Relaxed oversized fit in heavy jersey cotton",
};

export function isOversizedCategory(category: string): boolean {
  return category === PRODUCT_CATEGORIES.OVERSIZED;
}

export function getCategoryFromQuality(quality: string): ProductCategory {
  return quality.toUpperCase().includes("OVERSIZED")
    ? PRODUCT_CATEGORIES.OVERSIZED
    : PRODUCT_CATEGORIES.PLAIN;
}

export const RETAIL_PRICE_STANDARD = 499;
export const RETAIL_PRICE_PREMIUM = 599;

/** Standard 180 GSM plain tees sell at ₹499; premium fabrics at ₹599. */
export function getRetailPrice(quality: string): number {
  if (/180\s*GSM/i.test(quality) && !/OVERSIZED/i.test(quality)) {
    return RETAIL_PRICE_STANDARD;
  }
  return RETAIL_PRICE_PREMIUM;
}
