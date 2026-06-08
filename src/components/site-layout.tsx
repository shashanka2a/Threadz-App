"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ShoppingCart, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = mounted && resolvedTheme === "dark";

  const toggleDarkMode = () => {
    setTheme(darkMode ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <header className="border-b border-border bg-background transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/shop"
                className="text-sm uppercase tracking-wider text-foreground hover:opacity-70 transition-opacity"
              >
                Shop
              </Link>
              <Link
                href="/ai-studio"
                className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-opacity"
              >
                AI Studio
              </Link>
            </div>

            <Link href="/" className="flex flex-col items-center">
              <span className="text-2xl tracking-wider font-serif text-foreground">
                THREADZ
              </span>
              <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Premium Cotton T-Shirts.
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {mounted && darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Account</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/cart")}
                className="rounded-full relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-black text-white"
                  >
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Cart ({cartCount})</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border mt-20 bg-background transition-colors">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif text-lg mb-4 text-foreground">THREADZ</h3>
              <p className="text-sm text-muted-foreground">
                Create custom apparel with AI-powered designs on premium fabrics.
              </p>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 text-foreground">
                Shop
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/shop" className="hover:text-foreground transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?category=Plain T-Shirts"
                    className="hover:text-foreground transition-colors"
                  >
                    Plain T-Shirts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?category=Oversized T-Shirts"
                    className="hover:text-foreground transition-colors"
                  >
                    Oversized T-Shirts
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 text-foreground">
                Support
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Size Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 text-foreground">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Sustainability
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 THREADZ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
