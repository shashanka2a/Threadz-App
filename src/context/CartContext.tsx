"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, Product } from "../types/product";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  clearShippingAddress: () => void;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "threadz.checkout.shippingAddress";
const DELIVERY_FEE_KEY = "threadz.checkout.deliveryFee";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddressState] =
    useState<ShippingAddress | null>(null);
  const [deliveryFee, setDeliveryFeeState] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setShippingAddressState(JSON.parse(raw) as ShippingAddress);
      const feeRaw = localStorage.getItem(DELIVERY_FEE_KEY);
      if (feeRaw) setDeliveryFeeState(Number(feeRaw) || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (shippingAddress) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shippingAddress));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [shippingAddress]);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_FEE_KEY, String(deliveryFee));
    } catch {
      // ignore
    }
  }, [deliveryFee]);

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.selectedSize === size
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        { ...product, selectedSize: size, cartQuantity: quantity },
      ];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedSize === size))
    );
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === size
          ? { ...item, cartQuantity: quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDeliveryFeeState(0);
    try {
      localStorage.removeItem(DELIVERY_FEE_KEY);
    } catch {
      // ignore
    }
  };

  const setShippingAddress = (address: ShippingAddress) => {
    setShippingAddressState(address);
  };

  const clearShippingAddress = () => {
    setShippingAddressState(null);
    setDeliveryFeeState(0);
    try {
      localStorage.removeItem(DELIVERY_FEE_KEY);
    } catch {
      // ignore
    }
  };

  const setDeliveryFee = (fee: number) => {
    setDeliveryFeeState(Math.max(0, Math.round(fee)));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        shippingAddress,
        setShippingAddress,
        clearShippingAddress,
        deliveryFee,
        setDeliveryFee,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
