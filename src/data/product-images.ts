/** GitHub assets folder — use raw URLs so images load in the app. */
export const PRODUCT_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/shashanka2a/Threadz-App/main/assets";

export const PRODUCT_IMAGE_BY_COLOR: Record<string, string> = {
  "Charcoal Melange": `${PRODUCT_IMAGE_BASE_URL}/charcoal.jpg`,
  "Grey Melange": `${PRODUCT_IMAGE_BASE_URL}/grey.jpg`,
  Cream: `${PRODUCT_IMAGE_BASE_URL}/cream.jpg`,
  "LT Green": `${PRODUCT_IMAGE_BASE_URL}/LTGreen.jpg`,
  Plum: `${PRODUCT_IMAGE_BASE_URL}/plum.jpg`,
  "P.T Blue": `${PRODUCT_IMAGE_BASE_URL}/PTBlue.jpg`,
  Burgundy: `${PRODUCT_IMAGE_BASE_URL}/Burgandry.jpg`,
  "Dusty Rose": `${PRODUCT_IMAGE_BASE_URL}/dustyRose.jpg`,
  Brown: `${PRODUCT_IMAGE_BASE_URL}/brown.jpg`,
  "Steel Grey": `${PRODUCT_IMAGE_BASE_URL}/steelGrey.jpg`,
  "Wild Ginger": `${PRODUCT_IMAGE_BASE_URL}/wildGinger.jpg`,
  "Moss Green": `${PRODUCT_IMAGE_BASE_URL}/mossGreen.jpg`,
  "Park Petrol": `${PRODUCT_IMAGE_BASE_URL}/parkPetrol.jpg`,
  Pink: `${PRODUCT_IMAGE_BASE_URL}/pink.jpg`,
};

export function getProductImageUrl(color: string): string {
  return PRODUCT_IMAGE_BY_COLOR[color] ?? `${PRODUCT_IMAGE_BASE_URL}/charcoal.jpg`;
}
