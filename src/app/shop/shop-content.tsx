"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductRating } from "@/components/product-rating";
import { Sparkles, Tag } from "lucide-react";
import { is180GsmItem } from "@/lib/pricing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/product-image";
import { ProductStockBadgeRow } from "@/components/product/product-stock-badges";

type ShopContentProps = {
  products: Product[];
  shopCategories: string[];
};

const BUNDLE_FILTER_LABEL = "⚡ 3 for ₹999 Offer";

export default function ShopContent({ products, shopCategories }: ShopContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const colors = [...new Set(products.map((p) => p.color))];
  const filterCategories = [...shopCategories, BUNDLE_FILTER_LABEL];

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "All Products"
  );
  const [selectedColor, setSelectedColor] = useState("All Colors");

  const filteredProducts = products.filter((product) => {
    let matchesCategory = true;
    if (selectedCategory === BUNDLE_FILTER_LABEL) {
      matchesCategory = is180GsmItem(product);
    } else if (selectedCategory !== "All Products") {
      matchesCategory = product.category === selectedCategory;
    }

    const matchesColor =
      selectedColor === "All Colors" || product.color === selectedColor;
    return matchesCategory && matchesColor;
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 text-foreground">
          Shop Collection
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Explore our premium plain &amp; oversized collection crafted with durable GSM fabrics
        </p>
      </div>

      {/* Promotional Bundle Offer Banner */}
      <div className="mb-8 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              🔥 Special Bundle Offer: Any 3 T-Shirts (180 GSM) for ₹999!
            </p>
            <p className="text-xs text-muted-foreground">
              Mix and match any colors or sizes. Regular ₹499 each — save ₹498 automatically in cart!
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setSelectedCategory(BUNDLE_FILTER_LABEL)}
          className="rounded-none bg-foreground text-background hover:bg-foreground/90 shrink-0 text-xs h-9 px-4 font-medium"
        >
          View 180 GSM Tees
        </Button>
      </div>

      {/* Category Quick Filter Pills */}
      <div
        className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter by category"
      >
        {filterCategories.map((category) => {
          const isActive = selectedCategory === category;
          const isBundlePill = category === BUNDLE_FILTER_LABEL;

          return (
            <button
              key={category}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : isBundlePill
                  ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters for Granular Selection */}
      <div className="mb-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
        <div className="w-full sm:w-64">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger aria-label="Select category filter" className="rounded-none border-border">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {filterCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedColor}
            onValueChange={(value) => setSelectedColor(value)}
          >
            <SelectTrigger aria-label="Select color filter" className="rounded-none border-border">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Colors">All Colors</SelectItem>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dynamic Count Announcement for Screen Readers & Users */}
      <div
        className="mb-6 text-center text-sm text-muted-foreground"
        aria-live="polite"
        role="status"
      >
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => {
          const discount = Math.round(
            ((product.mrp - product.price) / product.mrp) * 100
          );
          const isBestseller = index % 5 === 0 || index % 7 === 0;
          const isAboveTheFold = index < 4;
          const isEligibleForBundle = is180GsmItem(product);

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              aria-label={`View ${product.name}, price ₹${product.price}`}
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
                      <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{discount}% OFF</span>
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-card border border-border mt-6">
          <p className="text-muted-foreground mb-2 text-base">No products found matching your filters.</p>
          <p className="text-xs text-muted-foreground mb-4">Try clearing the color or category filters</p>
          <Button
            variant="outline"
            className="rounded-none border-foreground text-foreground hover:bg-accent"
            onClick={() => {
              setSelectedCategory("All Products");
              setSelectedColor("All Colors");
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}


