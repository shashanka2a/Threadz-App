"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Product } from "../types/product";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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
