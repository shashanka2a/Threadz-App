"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStockStatus } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { ProductImage } from "@/components/product-image";
import { ProductRating } from "@/components/product-rating";
import { KeyHighlights } from "@/components/product/key-highlights";
import { PincodeChecker } from "@/components/shipping/pincode-checker";
import type { Product } from "@/types/product";

type ProductDetailContentProps = {
  product: Product;
  allProducts: Product[];
};

export default function ProductDetailContent({
  product,
  allProducts,
}: ProductDetailContentProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.color);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(product, selectedSize, 1);
    toast.success("Added to cart");
  };

  const colorVariants = allProducts.filter((p) => p.quality === product.quality);
  const frequentlyBought = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const isOversized = product.category === PRODUCT_CATEGORIES.OVERSIZED;
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button onClick={() => router.push("/")} className="hover:text-black">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <button
          onClick={() => router.push(`/shop?category=${encodeURIComponent(product.category)}`)}
          className="hover:text-black"
        >
          {product.category}
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
            <ProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-100">
              <Heart className="h-5 w-5" />
            </button>
            <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-100">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="absolute top-4 right-16 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-100">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="rounded-none text-xs">
                  {product.category}
                </Badge>
                {isOversized && (
                  <Badge className="rounded-none text-xs bg-neutral-900 text-white">
                    Oversized Fit
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif">{product.name}</h1>
              <p className="text-sm text-neutral-600 mt-2">{product.description}</p>
            </div>
            <button className="p-2 hover:bg-neutral-100 rounded-full">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <span className="text-2xl sm:text-3xl">₹{product.price}</span>
            <span className="text-base sm:text-lg text-neutral-500 line-through">MRP: ₹{product.mrp}</span>
            <span className="text-sm text-green-600">{discount}% OFF</span>
          </div>
          <p className="text-sm text-neutral-600 mb-4">inclusive of all taxes</p>

          <ProductRating size="md" className="mb-2" />

          <p className="text-sm text-red-600 mb-6">Lowest price in last 30 days</p>

          <div className="mb-6">
            <h3 className="text-sm mb-3">Save extra with these offers</h3>
            <Card className="border-neutral-200 rounded-none bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Banknote className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm">Get 5% up to ₹250 only</p>
                    <p className="text-xs text-neutral-600">
                      Pay Any 3 Item on ₹700 (Get Extra 5min, Hurry!)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-neutral-500 mt-2">Offer will be auto-applied</p>
            <Button variant="outline" className="mt-2 text-xs rounded-none h-8 px-3">
              Other T&C
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm">Select Color - {selectedColor}</label>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {colorVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedColor(variant.color);
                    router.push(`/product/${variant.id}`);
                  }}
                  className={`relative w-14 h-14 shrink-0 border-2 rounded overflow-hidden ${
                    variant.id === product.id ? "border-black" : "border-neutral-300"
                  }`}
                >
                  <ProductImage src={variant.image} alt={variant.color} sizes="56px" />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm">Select Size</label>
              <button className="text-sm text-blue-600 hover:underline">Size Guide</button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map((size) => {
                const stock = product.sizeStock[size as keyof typeof product.sizeStock];
                const status = getStockStatus(stock);
                const disabled = status === "out-of-stock";

                return (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] rounded-none h-10 ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : disabled
                          ? "border-neutral-200 text-neutral-400 opacity-50"
                          : "border-neutral-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            className="w-full bg-blue-900 text-white hover:bg-blue-800 rounded-none mb-6"
          >
            Add to Cart
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="text-xs">CASH ON</p>
                <p className="text-xs">DELIVERY</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="text-xs">FREE</p>
                <p className="text-xs">SHIPPING</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-neutral-600" />
              <div>
                <p className="text-xs">EASY</p>
                <p className="text-xs">RETURNS</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <PincodeChecker />
          </div>

          <KeyHighlights imageSrc={product.image} />

          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-6">
              <h3 className="text-sm uppercase tracking-wider mb-4">Fabric &amp; Quality</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex justify-between gap-4">
                  <span>Category</span>
                  <span className="text-right">{product.category}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Fabric Weight</span>
                  <span className="text-right">{product.gsm}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Quality</span>
                  <span className="text-right max-w-[60%]">{product.quality}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Color</span>
                  <span className="text-right">{product.color}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Fit</span>
                  <span className="text-right">{isOversized ? "Oversized" : "Regular"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-serif mb-6">Frequently bought together</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {frequentlyBought.map((item) => (
            <Card
              key={item.id}
              className="border-neutral-200 rounded-none cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/product/${item.id}`)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square bg-neutral-100">
                  <ProductImage src={item.image} alt={item.name} />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  <p className="text-sm text-neutral-600 mb-2">{item.color}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">₹{item.price}</span>
                    <span className="text-sm text-neutral-500 line-through">₹{item.mrp}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
