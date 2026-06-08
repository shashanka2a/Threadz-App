"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products, categories, colors } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/product-image";

export default function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "All Products"
  );
  const [selectedColor, setSelectedColor] = useState("All Colors");

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All Products" ||
      product.category === selectedCategory;
    const matchesColor =
      selectedColor === "All Colors" || product.color === selectedColor;
    return matchesCategory && matchesColor;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-serif mb-4">Shop</h1>
        <p className="text-neutral-600">
          Explore our premium collection of customizable apparel
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <div className="w-64">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className="rounded-none border-neutral-300">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <Select
            value={selectedColor}
            onValueChange={(value) => setSelectedColor(value)}
          >
            <SelectTrigger className="rounded-none border-neutral-300">
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

      <div className="mb-6 text-center text-sm text-neutral-600">
        Showing {filteredProducts.length} products
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => {
          const discount = Math.round(
            ((product.mrp - product.price) / product.mrp) * 100
          );
          const isBestseller = index % 5 === 0 || index % 7 === 0;

          return (
            <Card
              key={product.id}
              className="border-neutral-200 overflow-hidden rounded-none hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/product/${product.id}`)}
            >
              <CardContent className="p-0">
                <div className="relative bg-neutral-100 aspect-square">
                  <ProductImage src={product.image} alt={product.name} />
                  {isBestseller && (
                    <Badge className="absolute top-3 left-3 bg-yellow-400 text-black rounded-none text-xs">
                      BESTSELLER
                    </Badge>
                  )}
                </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="rounded-none text-[10px]">
                        {product.category}
                      </Badge>
                      {product.quantity < 25 && (
                        <Badge variant="destructive" className="rounded-none text-[10px]">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    ))}
                    <Star className="w-3 h-3 text-neutral-300" />
                  </div>
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-sm text-neutral-600 mb-1">{product.color}</p>
                    <p className="text-xs text-neutral-500 mb-2 line-clamp-1">{product.quality}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">₹{product.price}</span>
                    <span className="text-sm text-neutral-500 line-through">₹{product.mrp}</span>
                    <span className="text-sm text-green-600">{discount}% OFF</span>
                  </div>
                  <p className="text-xs text-neutral-500">Lowest price in last 30 days</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-neutral-600">No products found matching your filters.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-none"
            onClick={() => {
              setSelectedCategory("All Products");
              setSelectedColor("All Colors");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
