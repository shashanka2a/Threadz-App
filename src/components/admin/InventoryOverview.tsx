"use client";

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Package, AlertTriangle, TrendingUp, ShoppingBag, DollarSign, Layers } from "lucide-react";
import { PRODUCT_CATEGORIES } from "../../data/categories";
import type { Product } from "@/types/product";
import type { InventoryStats } from "@/types/inventory";

type InventoryOverviewProps = {
  products: Product[];
  stats: InventoryStats;
};

export function InventoryOverview({ products, stats }: InventoryOverviewProps) {
  const { totalQuantity, totalInventoryValue, lowStockItems, lowStockCount, categoryStats, avgPrice } =
    stats;

  const categoryBreakdown = Object.entries(categoryStats).map(([name, data]) => ({
    name,
    ...data,
  }));

  const healthySkuPercent =
    products.length > 0
      ? (((products.length - lowStockCount) / products.length) * 100).toFixed(0)
      : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Products</p>
                <p className="text-3xl">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Stock</p>
                <p className="text-3xl">{totalQuantity}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Inventory Value</p>
                <p className="text-3xl">₹{totalInventoryValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Low Stock SKUs</p>
                <p className="text-3xl">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-neutral-600" />
              <h3 className="text-lg font-medium">Category Performance</h3>
            </div>
            <div className="space-y-4">
              {categoryBreakdown.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded"
                >
                  <div>
                    <p className="font-medium mb-1">{category.name}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>{category.products} SKUs</span>
                      <span>•</span>
                      <span>{category.stock} units</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">₹{category.value.toLocaleString()}</p>
                    <p className="text-xs text-neutral-600">Total Value</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-700" />
              <h3 className="text-lg font-medium">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-neutral-600">All SKUs are above the low-stock threshold.</p>
              ) : (
                lowStockItems
                  .sort((a, b) => a.quantity - b.quantity)
                  .slice(0, 6)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-sm mb-1">{item.color}</p>
                        <p className="text-xs text-neutral-600">{item.category}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.quality}</p>
                      </div>
                      <Badge className="rounded-none bg-yellow-400 text-black hover:bg-yellow-400">
                        {item.quantity} left
                      </Badge>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-neutral-600" />
              <h4 className="font-medium">Average Cost</h4>
            </div>
            <p className="text-2xl">₹{avgPrice.toFixed(2)}</p>
            <p className="text-xs text-neutral-600 mt-1">per unit</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-5 w-5 text-neutral-600" />
              <h4 className="font-medium">Categories</h4>
            </div>
            <p className="text-2xl">{categoryBreakdown.length}</p>
            <p className="text-xs text-neutral-600 mt-1">Plain &amp; Oversized</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-neutral-600" />
              <h4 className="font-medium">Stock Health</h4>
            </div>
            <p className="text-2xl">{healthySkuPercent}%</p>
            <p className="text-xs text-neutral-600 mt-1">SKUs above low-stock threshold</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200 rounded-none">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Inventory Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-medium text-blue-600">
                {categoryStats[PRODUCT_CATEGORIES.PLAIN]?.products ?? 0}
              </p>
              <p className="text-sm text-neutral-600 mt-1">Plain T-Shirts</p>
              <p className="text-xs text-neutral-500">
                {categoryStats[PRODUCT_CATEGORIES.PLAIN]?.stock ?? 0} units
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-purple-600">
                {categoryStats[PRODUCT_CATEGORIES.OVERSIZED]?.products ?? 0}
              </p>
              <p className="text-sm text-neutral-600 mt-1">Oversized T-Shirts</p>
              <p className="text-xs text-neutral-500">
                {categoryStats[PRODUCT_CATEGORIES.OVERSIZED]?.stock ?? 0} units
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-green-600">{products.length}</p>
              <p className="text-sm text-neutral-600 mt-1">Color Variants</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-orange-600">{totalQuantity}</p>
              <p className="text-sm text-neutral-600 mt-1">Total Units</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
