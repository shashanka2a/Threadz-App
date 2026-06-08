"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { AdminOrder } from "@/lib/db/admin-orders";

type OrdersOverviewProps = {
  orders: AdminOrder[];
};

function paymentIcon(method: string) {
  switch (method) {
    case "upi":
      return Wallet;
    case "card":
      return CreditCard;
    case "cod":
      return Banknote;
    default:
      return ShoppingBag;
  }
}

export function OrdersOverview({ orders }: OrdersOverviewProps) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const today = new Date().toDateString();
  const todaysOrders = orders.filter(
    (order) => new Date(order.createdAt).toDateString() === today,
  );

  const paymentBreakdown = orders.reduce<Record<string, number>>((acc, order) => {
    const key = order.paymentMethod.toUpperCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Orders</p>
                <p className="text-3xl">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
                <p className="text-3xl">₹{totalRevenue.toLocaleString()}</p>
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
                <p className="text-sm text-neutral-600 mb-1">Items Sold</p>
                <p className="text-3xl">{totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Today&apos;s Orders</p>
                <p className="text-3xl">{todaysOrders.length}</p>
                <p className="text-xs text-neutral-500 mt-1">Avg ₹{avgOrderValue}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Banknote className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
            {Object.keys(paymentBreakdown).length === 0 ? (
              <p className="text-sm text-neutral-600">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(paymentBreakdown).map(([method, count]) => {
                  const Icon = paymentIcon(method.toLowerCase());
                  const percent = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-neutral-600" />
                        <span className="text-sm">{method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">{count} orders</span>
                        <Badge variant="outline" className="rounded-none text-xs">
                          {percent}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-600">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-xs text-neutral-600">{order.fullName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{order.total}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
