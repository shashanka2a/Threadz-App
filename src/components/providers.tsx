"use client";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <CartProvider>
        {children}
        <Toaster position="top-center" />
      </CartProvider>
    </ThemeProvider>
  );
}
