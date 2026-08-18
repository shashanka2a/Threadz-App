"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { InventoryOverview } from "@/components/admin/InventoryOverview";
import { OrdersTable } from "@/components/admin/OrdersTable";
import {
  Loader2,
  Package,
  BarChart3,
  FolderOpen,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import type { AdminCatalog } from "@/types/admin";
import type { AdminOrder } from "@/lib/db/admin-orders";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { StockDetailsTab } from "@/app/inventory/stock-details-tab";

export default function InventoryPage() {
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [catalogRes, ordersRes] = await Promise.all([
        fetch("/api/admin/catalog"),
        fetch("/api/admin/orders"),
      ]);

      const catalogData = (await catalogRes.json()) as AdminCatalog & { error?: string };
      const ordersData = (await ordersRes.json()) as { orders?: AdminOrder[]; error?: string };

      if (!catalogRes.ok) {
        throw new Error(catalogData.error ?? "Failed to load inventory");
      }

      setCatalog(catalogData);
      setOrders(ordersData.orders ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load inventory";
      setError(message);
      setCatalog(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  const cancelledOrdersCount = orders.filter(
    (o) => o.status.toLowerCase() === "cancelled"
  ).length;

  const returnOrdersCount = orders.filter(
    (o) =>
      o.status.toLowerCase() === "return_requested" ||
      o.status.toLowerCase() === "returned"
  ).length;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10 max-w-7xl">
      <AdminNav />

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-serif mb-1.5">Inventory Management</h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Manage products, categories, track inventory, schedule return pickups, and process refunds
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
          <button type="button" onClick={() => void loadData()} className="text-sm underline">
            Try again
          </button>
        </div>
      ) : catalog ? (
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-5 gap-1 p-1 mb-0 rounded-none bg-neutral-100 border border-neutral-200">
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
            <TabsTrigger
              value="cancelled"
              className="rounded-none py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-red-700 data-[state=active]:text-red-700"
            >
              <RotateCcw className="h-4 w-4 mr-1.5 sm:mr-2 text-red-600" />
              <span className="text-xs sm:text-sm">
                Returns &amp; Cancelled ({cancelledOrdersCount + returnOrdersCount})
              </span>
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
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement
              categories={catalog.categories}
              onRefresh={loadData}
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

          <TabsContent value="cancelled">
            <div className="space-y-4">
              <div className="bg-red-50/70 border border-red-200 p-4">
                <h3 className="font-serif text-lg text-red-900 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-red-600" />
                  Cancelled Orders &amp; Restocked Inventory
                </h3>
                <p className="text-xs sm:text-sm text-red-700 mt-1">
                  When an order is cancelled, all items are automatically restored to active inventory. Use the &quot;Initiate Refund&quot; button to process customer refunds directly via Razorpay API.
                </p>
              </div>

              <OrdersTable
                orders={orders}
                onRefresh={loadData}
                defaultView="cancelled"
                hideViewTabs={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}

