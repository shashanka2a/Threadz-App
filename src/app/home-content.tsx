"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductRating } from "@/components/product-rating";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
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
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-6">
            <span className="font-serif text-foreground">Premium.</span>
            <br />
            <span className="font-serif italic text-muted-foreground">Everyday T-Shirts.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Plain and oversized cotton t-shirts in rich colours and durable GSM fabrics.
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Built for everyday comfort, bulk orders, and merch drops.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => router.push("/shop")}
              className="bg-foreground text-background hover:bg-foreground/90 px-8 rounded-none"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push("/ai-studio")}
              variant="outline"
              className="border-foreground text-foreground hover:bg-accent px-8 rounded-none"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try AI Studio
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-2 text-foreground">Our Collection</h2>
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

            return (
              <Card
                key={product.id}
                className="border-border rounded-none overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-card"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative bg-muted aspect-square">
                    <ProductImage src={product.image} alt={product.name} />
                    {isBestseller && (
                      <Badge className="absolute top-3 left-3 bg-yellow-400 text-black dark:bg-yellow-500 dark:text-black rounded-none text-xs">
                        BESTSELLER
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="rounded-none text-[10px]">
                        {product.category}
                      </Badge>
                    </div>
                    <ProductRating className="mb-1" />
                    <h3 className="font-medium mb-1 text-card-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{product.color}</p>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.quality}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg text-card-foreground">₹{product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.mrp}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {discount}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Lowest price in last 30 days</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => router.push("/shop")}
            variant="outline"
            className="border-foreground text-foreground hover:bg-accent px-8 rounded-none"
          >
            View All Products
          </Button>
        </div>
      </section>
    </div>
  );
}
