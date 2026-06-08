"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Truck,
  RotateCcw,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/product-image";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product?.color || "");

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
        <Button onClick={() => router.push("/shop")} variant="outline" className="rounded-none">
          Back to Shop
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(product, selectedSize, 1);
    toast.success("Added to cart");
  };

  const colorVariants = products.filter((p) => p.category === product.category).slice(0, 5);
  const frequentlyBought = products.filter((p) => p.id !== product.id).slice(0, 3);
  const randomBuyers = Math.floor(Math.random() * 300) + 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
        <button onClick={() => router.push("/")} className="hover:text-black">
          Home
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-serif">{product.name}</h1>
            <button className="p-2 hover:bg-neutral-100 rounded-full">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl">₹{product.price}</span>
            <span className="text-lg text-neutral-500 line-through">MRP: ₹{product.mrp}</span>
          </div>
          <p className="text-sm text-neutral-600 mb-1">inclusive of all taxes</p>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
              <Star className="w-4 h-4 text-neutral-300" />
            </div>
          </div>

          <p className="text-sm text-red-600 mb-1">Lowest price in last 30 days</p>
          <p className="text-sm text-red-600 mb-6">
            {randomBuyers} people bought this in last 7 days
          </p>

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
            <div className="flex gap-3">
              {colorVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedColor(variant.color);
                    router.push(`/product/${variant.id}`);
                  }}
                  className={`relative w-14 h-14 border-2 rounded overflow-hidden ${
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
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[60px] rounded-none ${
                    selectedSize === size
                      ? "bg-black text-white border-black"
                      : "border-neutral-300 hover:border-black"
                  }`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            className="w-full bg-blue-900 text-white hover:bg-blue-800 rounded-none mb-6"
          >
            Add to Cart
          </Button>

          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-neutral-200">
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
            <h3 className="text-sm mb-3">Key Highlights</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative aspect-video bg-neutral-100 rounded overflow-hidden">
                  <ProductImage src={product.image} alt={`Highlight ${i}`} sizes="150px" />
                </div>
              ))}
            </div>
          </div>

          <Card className="border-neutral-200 rounded-none">
            <CardContent className="p-6">
              <h3 className="text-sm uppercase tracking-wider mb-4">Product Details</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Fabric Weight:</span>
                  <span>{product.gsm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span>{product.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color:</span>
                  <span>{product.color}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Sizes:</span>
                  <span>{product.sizes.join(", ")}</span>
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
