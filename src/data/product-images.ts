/** Cloudinary-hosted product images. */
export const PRODUCT_IMAGE_BASE_URL =
  "https://res.cloudinary.com/ddmv1btb9/image/upload";

export const PRODUCT_IMAGE_BY_COLOR: Record<string, string> = {
  "Burgundy": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705767/Burgandry_ubwprt.jpg",
  "LT Green": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705768/LTGreen_kivfro.jpg",
  "P.T Blue": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705771/PTBlue_lbgdrv.jpg",
  "Brown": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705772/brown_hgbhid.jpg",
  "Charcoal Melange": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705773/charcoal_qjxuld.jpg",
  "Cream": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705774/cream_tk7agx.jpg",
  "Dusty Rose": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705775/dustyRose_blszip.jpg",
  "Grey Melange": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705778/grey_qkze5u.jpg",
  "Moss Green": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705780/mossGreen_tgogej.jpg",
  "Park Petrol": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705782/parkPetrol_fxjrxh.jpg",
  "Pink": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705784/pink_xnhxip.jpg",
  "Plum": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705785/plum_doceoj.jpg",
  "Steel Grey": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705787/steelGrey_gq3iex.jpg",
  "Wild Ginger": "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705789/wildGinger_rc3pdj.jpg",
};

export function getProductImageUrl(color: string): string {
  return PRODUCT_IMAGE_BY_COLOR[color] ?? "https://res.cloudinary.com/ddmv1btb9/image/upload/v1781705773/charcoal_qjxuld.jpg";
}
