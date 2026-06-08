"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { InventoryOverview } from "@/components/admin/InventoryOverview";
import { Loader2, Package, BarChart3, FolderOpen, TrendingUp } from "lucide-react";
import type { AdminCatalog } from "@/types/admin";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { StockDetailsTab } from "@/app/inventory/stock-details-tab";

export default function InventoryPage() {
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/catalog");
      const data = (await response.json()) as AdminCatalog & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load inventory");
      }

      setCatalog(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load inventory";
      setError(message);
      setCatalog(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const inventory = catalog?.inventory ?? [];
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.quality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Low Stock" && item.quantity < 25) ||
      (filterStatus === "In Stock" && item.quantity >= 25);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalInventoryValue = catalog?.stats.totalInventoryValue ?? 0;
  const totalQuantity = catalog?.stats.totalQuantity ?? 0;
  const lowStockItems = catalog?.stats.lowStockCount ?? 0;
  const categories = ["All", PRODUCT_CATEGORIES.PLAIN, PRODUCT_CATEGORIES.OVERSIZED];
  const categoryNames =
    catalog?.shopCategories.filter((name) => name !== "All Products") ?? [];

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-7xl">
      <AdminNav />

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-serif mb-1.5">Inventory Management</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Manage products, categories, and track inventory
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-neutral-600">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          Loading from database...
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-neutral-600 mb-4">{error}</p>
          <button type="button" onClick={() => void loadCatalog()} className="text-sm underline">
            Try again
          </button>
        </div>
      ) : catalog ? (
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-4 gap-1 p-1 mb-0 rounded-none bg-neutral-100 border border-neutral-200">
            <TabsTrigger
              value="overview"
              className="rounded-none py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="rounded-none py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Package className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-none py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FolderOpen className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">Categories</span>
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="rounded-none py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">Stock Details</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <InventoryOverview
              products={catalog.products}
              stats={catalog.stats}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement
              products={catalog.products}
              categories={categoryNames}
              onRefresh={loadCatalog}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement
              categories={catalog.categories}
              onRefresh={loadCatalog}
            />
          </TabsContent>

          <TabsContent value="stock">
            <StockDetailsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filteredInventory={filteredInventory}
              totalInventory={inventory}
              totalInventoryValue={totalInventoryValue}
              totalQuantity={totalQuantity}
              lowStockItems={lowStockItems}
              categories={categories}
            />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
