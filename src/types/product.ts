export interface Product {
  id: string;
  name: string;
  description: string;
  quality: string;
  color: string;
  price: number;
  mrp: number;
  image: string;
  category: string;
  gsm: string;
  sizes: string[];
  quantity: number;
}

export interface CartItem extends Product {
  selectedSize: string;
  cartQuantity: number;
}
