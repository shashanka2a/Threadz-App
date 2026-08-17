"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductRating } from "@/components/product-rating";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { ProductStockBadgeRow } from "@/components/product/product-stock-badges";
import { is180GsmItem } from "@/lib/pricing";
import type { Product } from "@/types/product";

type HomeContentProps = {
  products: Product[];
};

export default function HomeContent({ products }: HomeContentProps) {
  const router = useRouter();
  // Newest products first (getProducts orders by created_at desc)
  const featuredProducts = products.slice(0, 9);

  return (
    <div>
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-10 md:pt-20 md:pb-16" aria-labelledby="hero-heading">
        <div className="text-center max-w-4xl mx-auto">
          <Link
            href="/shop?category=Plain+T-Shirts"
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-all shadow-sm group"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span>Introductory Offer: Any 3 (180 GSM) for ₹999</span>
            <ArrowRight className="h-3 w-3 ml-0.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>

          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-6">
            <span className="font-serif text-foreground">Premium.</span>
            <br />
            <span className="font-serif italic text-muted-foreground">Everyday T-Shirts.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-3 max-w-2xl mx-auto">
            Plain and oversized cotton t-shirts in rich colours and durable GSM fabrics.
          </p>
          <p className="text-base text-muted-foreground/90 mb-8 max-w-xl mx-auto">
            Built for everyday luxury, bulk orders, and merch drops.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => router.push("/shop")}
              className="bg-foreground text-background hover:bg-foreground/90 px-8 rounded-none transition-transform hover:scale-105 active:scale-95 h-12 text-base font-medium"
            >
              Shop Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/ai-studio")}
              variant="outline"
              className="border-foreground text-foreground hover:bg-accent px-8 rounded-none transition-transform hover:scale-105 active:scale-95 h-12 text-base font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try AI Studio
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Introductory Offer Banner Section */}
      <section className="container mx-auto px-4 mb-16" aria-labelledby="introductory-offer-heading">
        <div className="relative overflow-hidden border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-orange-500/10 dark:from-amber-950/30 dark:via-card dark:to-orange-950/20 p-6 sm:p-8 md:p-12 shadow-sm">
          {/* Decorative subtle background elements */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Introductory Offer
              </div>

              <h2 id="introductory-offer-heading" className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground leading-tight">
                3 T-Shirts for <span className="underline decoration-amber-500 decoration-wavy underline-offset-8">₹999</span>
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Experience Threadz signature 180 GSM combed cotton. Mix &amp; match any 3 colors or sizes. Regular ₹1,497 — save <span className="font-semibold text-foreground">₹498 automatically</span> in your cart!
              </p>

              {/* Value Props Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-medium text-foreground">
                <div className="flex items-center gap-2 bg-background/60 dark:bg-muted/40 p-2.5 border border-border">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>
                  <span>180 GSM Cotton</span>
                </div>
                <div className="flex items-center gap-2 bg-background/60 dark:bg-muted/40 p-2.5 border border-border">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>
                  <span>Auto-Applied Discount</span>
                </div>
                <div className="flex items-center gap-2 bg-background/60 dark:bg-muted/40 p-2.5 border border-border col-span-2 sm:col-span-1">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">✓</span>
                  <span>Free Express Delivery</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/shop?category=Plain+T-Shirts")}
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 rounded-none h-12 px-8 text-base font-medium transition-transform hover:scale-105 active:scale-95 shadow-md"
                >
                  Shop 3 for ₹999 Bundle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  *Discount applies automatically in cart when any 3 qualifying tees are added.
                </span>
              </div>
            </div>

            {/* Qualifying 180 GSM Thumbnails Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Qualifying 180 GSM Styles
                  </span>
                  <Badge variant="outline" className="text-[10px] rounded-none border-amber-500/40 text-amber-700 dark:text-amber-300">
                    Mix &amp; Match
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {products.filter(is180GsmItem).slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.id}`}
                      className="group relative aspect-square bg-muted overflow-hidden border border-border hover:border-amber-500/60 transition-all block"
                      aria-label={`View ${item.name}`}
                    >
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        sizes="(max-width: 768px) 30vw, 15vw"
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium truncate w-full">
                          {item.color}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="pt-1 text-center">
                  <Link
                    href="/shop?category=Plain+T-Shirts"
                    className="text-xs font-medium text-foreground underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1"
                  >
                    View all 180 GSM colors <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Collection Section */}
      <section className="container mx-auto px-4 py-16" aria-labelledby="collection-heading">
        <div className="mb-8">
          <h2 id="collection-heading" className="text-2xl sm:text-3xl md:text-4xl font-serif mb-2 text-foreground">
            Our Collection
          </h2>
          <p className="text-muted-foreground">
            Explore our premium quality t-shirts in various colors
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredProducts.map((product, index) => {
            const discount = Math.round(
              ((product.mrp - product.price) / product.mrp) * 100
            );
            const isBestseller = index === 0 || index === 5;
            const isAboveTheFold = index < 3;
            const isEligibleForBundle = is180GsmItem(product);

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                aria-label={`View details for ${product.name} - ₹${product.price}`}
                className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full border-border rounded-none overflow-hidden bg-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-foreground/30">
                  <CardContent className="p-0">
                    <div className="relative bg-muted aspect-square overflow-hidden">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        priority={isAboveTheFold}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                      {isBestseller && (
                        <Badge className="absolute top-3 left-3 bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black rounded-none text-xs shadow-sm z-20">
                          BESTSELLER
                        </Badge>
                      )}
                      {isEligibleForBundle && (
                        <Badge className="absolute bottom-3 left-3 bg-amber-500 text-black rounded-none text-[10px] font-bold shadow-sm z-20">
                          3 FOR ₹999
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="rounded-none text-[10px]">
                          {product.category}
                        </Badge>
                        <ProductStockBadgeRow product={product} />
                      </div>
                      <ProductRating className="mb-1" />
                      <h3 className="font-medium mb-1 text-card-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">{product.color}</p>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.quality}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-medium text-card-foreground">₹{product.price}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.mrp}
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {discount}% OFF
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isEligibleForBundle ? "Buy 3 for ₹999 in cart" : "Lowest price in last 30 days"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => router.push("/shop")}
            variant="outline"
            className="border-foreground text-foreground hover:bg-accent px-8 rounded-none transition-transform hover:scale-105 active:scale-95"
          >
            View All Products
          </Button>
        </div>
      </section>
    </div>
  );
}


