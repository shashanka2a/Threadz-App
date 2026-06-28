"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ShoppingCart,
  Moon,
  Sun,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { UserAccountButton } from "@/components/user-account-button";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  {
    href: `/shop?category=${encodeURIComponent(PRODUCT_CATEGORIES.PLAIN)}`,
    label: "Plain T-Shirts",
  },
  {
    href: `/shop?category=${encodeURIComponent(PRODUCT_CATEGORIES.OVERSIZED)}`,
    label: "Oversized T-Shirts",
  },
  { href: "/ai-studio", label: "AI Studio" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex flex-col items-center text-center min-w-0">
      <span
        className={`tracking-wider font-serif text-foreground ${
          compact ? "text-xl sm:text-2xl" : "text-2xl"
        }`}
      >
        THREADZ
      </span>
      <span
        className={`tracking-widest text-muted-foreground uppercase ${
          compact
            ? "hidden min-[380px]:block text-[9px] leading-tight max-w-[140px] truncate"
            : "text-[10px]"
        }`}
      >
        Premium Cotton T-Shirts.
      </span>
    </Link>
  );
}

function CartButton({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { cartCount } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        onNavigate?.();
        router.push("/cart");
      }}
      className="rounded-full relative shrink-0"
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
  );
}

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(darkMode ? "light" : "dark")}
      className={`rounded-full shrink-0 ${className ?? ""}`}
    >
      {mounted && darkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const accountHref = user ? "/profile" : "/login";
  const accountLabel = user ? "Profile" : "Sign in";

  return (
    <SheetContent side="left" className="w-[min(100vw-2rem,320px)] rounded-none p-0">
      <SheetHeader className="border-b border-border px-6 py-5 text-left">
        <SheetTitle className="font-serif text-xl tracking-wider">THREADZ</SheetTitle>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Premium Cotton T-Shirts
        </p>
      </SheetHeader>

      <nav className="flex flex-col px-2 py-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="px-4 py-3 text-sm uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-border px-6 py-5 space-y-3">
        <Button
          variant="outline"
          className="w-full rounded-none justify-start"
          onClick={() => {
            onNavigate();
            router.push(accountHref);
          }}
        >
          <User className="h-4 w-4 mr-2" />
          {accountLabel}
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-none justify-start"
          onClick={() => {
            onNavigate();
            router.push("/cart");
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          View cart
        </Button>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </SheetContent>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background transition-colors overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Mobile header */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <MobileNav onNavigate={closeMobileMenu} />
            </Sheet>

            <div className="flex justify-center px-1">
              <Logo compact />
            </div>

            <div className="flex items-center justify-end gap-1">
              <UserAccountButton />
              <CartButton />
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between">
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

            <Logo />

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserAccountButton />
              <CartButton />
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border mt-12 md:mt-20 bg-background transition-colors">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif text-lg mb-4 text-foreground">THREADZ</h3>
              <p className="text-sm text-muted-foreground">
                Premium cotton t-shirts in plain and oversized fits for everyday wear.
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
                    href={`/shop?category=${encodeURIComponent(PRODUCT_CATEGORIES.PLAIN)}`}
                    className="hover:text-foreground transition-colors"
                  >
                    Plain T-Shirts
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/shop?category=${encodeURIComponent(PRODUCT_CATEGORIES.OVERSIZED)}`}
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
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-foreground transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-foreground transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="hover:text-foreground transition-colors">
                    Size Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-wider mb-4 text-foreground">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/sustainability" className="hover:text-foreground transition-colors">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
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
