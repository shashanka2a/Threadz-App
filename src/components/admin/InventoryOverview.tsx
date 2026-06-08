"use client";

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Package, AlertTriangle, TrendingUp, ShoppingBag, DollarSign, Layers } from "lucide-react";
import { products } from "../../data/products";
import { inventoryData } from "../../data/inventory";

export function InventoryOverview() {
  const totalProducts = products.length;
  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventoryData.filter((item) => item.quantity < 25).length;
  const categories = ["T-Shirts", "Polo Shirts", "Heavy Jersey", "Interlock"];

  const avgPrice = totalInventoryValue / totalQuantity;

  // Top selling categories (mock data)
  const categoryStats = [
    { name: "T-Shirts", products: 6, stock: 180, value: 28800 },
    { name: "Heavy Jersey", products: 4, stock: 95, value: 20805 },
    { name: "Polo Shirts", products: 3, stock: 79, value: 13825 },
  ];

  // Low stock alerts
  const lowStockProducts = inventoryData
    .filter((item) => item.quantity < 25)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Products</p>
                <p className="text-3xl">{totalProducts}</p>
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
                <p className="text-3xl">₹{(totalInventoryValue / 1000).toFixed(1)}k</p>
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
                <p className="text-sm text-neutral-600 mb-1">Low Stock Alerts</p>
                <p className="text-3xl">{lowStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-neutral-600" />
              <h3 className="text-lg font-medium">Category Performance</h3>
            </div>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-4 bg-neutral-50 rounded">
                  <div>
                    <p className="font-medium mb-1">{category.name}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>{category.products} products</span>
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

        {/* Low Stock Alerts */}
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-medium">Low Stock Alerts</h3>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded">
                  <div>
                    <p className="font-medium text-sm mb-1">{item.color}</p>
                    <p className="text-xs text-neutral-600">{item.quality.substring(0, 30)}...</p>
                  </div>
                  <Badge variant="destructive" className="rounded-none">
                    {item.quantity} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-neutral-600" />
              <h4 className="font-medium">Average Price</h4>
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
            <p className="text-2xl">{categories.length}</p>
            <p className="text-xs text-neutral-600 mt-1">active categories</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-neutral-600" />
              <h4 className="font-medium">Stock Status</h4>
            </div>
            <p className="text-2xl">{((totalQuantity - lowStockItems) / totalQuantity * 100).toFixed(0)}%</p>
            <p className="text-xs text-neutral-600 mt-1">healthy stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-neutral-200 rounded-none">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Inventory Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-medium text-blue-600">6</p>
              <p className="text-sm text-neutral-600 mt-1">T-Shirts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-purple-600">3</p>
              <p className="text-sm text-neutral-600 mt-1">Polo Shirts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-green-600">4</p>
              <p className="text-sm text-neutral-600 mt-1">Heavy Jersey</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-medium text-orange-600">14</p>
              <p className="text-sm text-neutral-600 mt-1">Color Variants</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
