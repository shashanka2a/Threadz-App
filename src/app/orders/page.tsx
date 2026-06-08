"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminNav } from "@/components/admin/AdminNav";
import { OrdersOverview } from "@/components/admin/OrdersOverview";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { BarChart3, ListOrdered, Loader2 } from "lucide-react";
import type { AdminOrder } from "@/lib/db/admin-orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/orders");
      const data = (await response.json()) as { orders?: AdminOrder[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load orders");
      }

      setOrders(data.orders ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="container mx-auto px-4 py-12">
      <AdminNav />

      <div className="mb-8">
        <h1 className="text-4xl font-serif mb-2">Order Management</h1>
        <p className="text-neutral-600">View and track customer orders from Supabase</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-neutral-600">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          Loading orders...
        </div>
      ) : error ? (
        <div className="text-center py-24">
          <p className="text-neutral-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="text-sm underline hover:text-black"
          >
            Try again
          </button>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 rounded-none">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ListOrdered className="h-4 w-4 mr-2" />
              All Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OrdersOverview orders={orders} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTable orders={orders} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
