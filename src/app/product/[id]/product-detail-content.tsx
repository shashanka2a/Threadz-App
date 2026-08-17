"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStockStatus } from "@/data/products";
import { canAddToCart, isProductSoldOut } from "@/lib/stock";
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
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { is180GsmItem } from "@/lib/pricing";
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
  const { addToCart, cartItems } = useCart();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.color);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const soldOut = isProductSoldOut(product);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    const existing = cartItems.find(
      (item) => item.id === product.id && item.selectedSize === selectedSize
    );
    const check = canAddToCart(
      product,
      selectedSize,
      1,
      existing?.cartQuantity ?? 0
    );

    if (!check.ok) {
      toast.error(check.message);
      return;
    }

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (addToCart(product, selectedSize, 1)) {
      toast.success("Added to cart");
    } else {
      toast.error("Could not add to cart");
    }
    setIsAdding(false);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | THREADZ`,
          text: `Check out ${product.name} on THREADZ`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted((prev) => {
      const next = !prev;
      toast.success(next ? "Added to wishlist" : "Removed from wishlist");
      return next;
    });
  };

  const colorVariants = allProducts.filter((p) => p.quality === product.quality);
  const frequentlyBought = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const isOversized = product.category === PRODUCT_CATEGORIES.OVERSIZED;
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Semantic Breadcrumbs (WCAG AA) */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Gallery */}
        <div>
          <div className="relative aspect-[3/4] bg-muted/40 overflow-hidden border border-border">
            <ProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <button
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWishlisted}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                isWishlisted
                  ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                  : "bg-background/90 text-foreground hover:bg-background"
              }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            <button
              aria-label="Previous product image"
              className="absolute top-4 left-4 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center hover:bg-background shadow-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next product image"
              className="absolute top-4 right-16 w-10 h-10 bg-background/90 rounded-full flex items-center justify-center hover:bg-background shadow-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="rounded-none text-xs">
                  {product.category}
                </Badge>
                {isOversized && (
                  <Badge className="rounded-none text-xs bg-foreground text-background">
                    Oversized Fit
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif text-foreground">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
            </div>
            <button
              onClick={handleShare}
              aria-label="Share product"
              className="p-2.5 hover:bg-muted rounded-full transition-colors shrink-0 text-foreground"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <span className="text-2xl sm:text-3xl font-medium text-foreground">₹{product.price}</span>
            <span className="text-base sm:text-lg text-muted-foreground line-through">MRP: ₹{product.mrp}</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{discount}% OFF</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">inclusive of all taxes</p>

          <ProductRating size="md" className="mb-2" />

          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-6">Lowest price in last 30 days</p>

          {/* Offers Card */}
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-foreground">Save extra with these offers</h3>
            
            {is180GsmItem(product) ? (
              <Card className="border-amber-500/30 rounded-none bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">Bundle Offer: 3 for ₹999</p>
                        <Badge className="bg-green-600 text-white rounded-none text-[10px] hover:bg-green-600">
                          Save ₹498
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Buy any 3 180 GSM T-shirts (mix and match colors/sizes) for just ₹999 instead of ₹1,497. Discount auto-applies in cart!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border rounded-none bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Banknote className="h-5 w-5 text-foreground mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Free Shipping & Returns</p>
                      <p className="text-xs text-muted-foreground">
                        All orders include free shipping and 7-day hassle-free returns.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <p className="text-xs text-muted-foreground">Offers are automatically applied at checkout</p>
          </div>


          {/* Color Variants (Accessible Radiogroup) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span id="color-label" className="text-sm font-medium text-foreground">
                Select Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
              </span>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="color-label"
              className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {colorVariants.map((variant) => {
                const isSelected = variant.id === product.id;
                return (
                  <button
                    key={variant.id}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Color ${variant.color}${isSelected ? ", currently selected" : ""}`}
                    onClick={() => {
                      setSelectedColor(variant.color);
                      router.push(`/product/${variant.id}`);
                    }}
                    className={`relative w-14 h-14 shrink-0 border-2 rounded overflow-hidden transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected ? "border-foreground scale-105 shadow-sm" : "border-border hover:border-foreground/50"
                    }`}
                  >
                    <ProductImage src={variant.image} alt={variant.color} sizes="56px" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector (Accessible Radiogroup) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span id="size-label" className="text-sm font-medium text-foreground">
                Select Size {selectedSize && <span className="font-normal text-muted-foreground">({selectedSize})</span>}
              </span>
              <Link
                href="/size-guide#size-chart"
                className="text-sm text-foreground underline underline-offset-4 hover:opacity-80"
              >
                Size Guide
              </Link>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="size-label"
              className="flex gap-3 flex-wrap"
            >
              {product.sizes.map((size) => {
                const stock = product.sizeStock[size as keyof typeof product.sizeStock];
                const status = getStockStatus(stock);
                const disabled = status === "out-of-stock";
                const isSelected = selectedSize === size;

                return (
                  <Button
                    key={size}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Size ${size}${disabled ? ", out of stock" : ""}`}
                    variant={isSelected ? "default" : "outline"}
                    disabled={disabled}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] rounded-none h-10 font-medium transition-all ${
                      isSelected
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : disabled
                          ? "border-border text-muted-foreground opacity-40"
                          : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={soldOut || isAdding}
            className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none mb-6 h-12 text-base font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Adding to Cart...
              </>
            ) : soldOut ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </Button>

          {/* Perks Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">CASH ON</p>
                <p className="text-xs text-muted-foreground">DELIVERY</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">PAN INDIA</p>
                <p className="text-xs text-muted-foreground">DELIVERY</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">EASY</p>
                <p className="text-xs text-muted-foreground">RETURNS</p>
              </div>
            </div>
          </div>

          {/* Pincode Checker */}
          <div className="mb-6">
            <PincodeChecker />
            <p className="text-xs text-muted-foreground mt-2">
              Powered by Delhivery · Enter your area pincode before ordering.
            </p>
          </div>

          <KeyHighlights imageSrc={product.image} />

          {/* Fabric & Quality Specifications */}
          <Card className="border-border rounded-none bg-card">
            <CardContent className="p-6">
              <h3 className="text-sm uppercase tracking-wider mb-4 text-foreground font-medium">Fabric &amp; Quality</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <span>Category</span>
                  <span className="text-right text-foreground">{product.category}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Fabric Weight</span>
                  <span className="text-right text-foreground">{product.gsm}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Quality</span>
                  <span className="text-right text-foreground max-w-[60%]">{product.quality}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Color</span>
                  <span className="text-right text-foreground">{product.color}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Fit</span>
                  <span className="text-right text-foreground">{isOversized ? "Oversized" : "Regular"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Frequently Bought Together */}
      <div className="mt-16">
        <h2 className="text-2xl font-serif mb-6 text-foreground">Frequently bought together</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {frequentlyBought.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.id}`}
              aria-label={`View ${item.name} - ₹${item.price}`}
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full border-border rounded-none bg-card overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:border-foreground/30">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted/40 overflow-hidden">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 text-card-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.color}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-card-foreground">₹{item.price}</span>
                      <span className="text-sm text-muted-foreground line-through">₹{item.mrp}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

