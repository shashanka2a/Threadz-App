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
  RotateCcw,
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
  const activeOrders = orders.filter((o) => o.status.toLowerCase() !== "cancelled");
  const cancelledOrders = orders.filter((o) => o.status.toLowerCase() === "cancelled");

  const totalActiveRevenue = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCancelledValue = cancelledOrders.reduce((sum, order) => sum + order.total, 0);

  const activeItemsSold = activeOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const restockedUnits = cancelledOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const avgActiveOrderValue =
    activeOrders.length > 0 ? Math.round(totalActiveRevenue / activeOrders.length) : 0;

  const today = new Date().toDateString();
  const todaysOrders = activeOrders.filter(
    (order) => new Date(order.createdAt).toDateString() === today
  );

  const paymentBreakdown = activeOrders.reduce<Record<string, number>>((acc, order) => {
    const key = order.paymentMethod.toUpperCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Active Orders</p>
                <p className="text-3xl font-semibold">{activeOrders.length}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {orders.length} total orders placed
                </p>
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
                <p className="text-sm text-neutral-600 mb-1">Net Revenue</p>
                <p className="text-3xl font-semibold">₹{totalActiveRevenue.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 mt-1">Avg ₹{avgActiveOrderValue} / order</p>
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
                <p className="text-sm text-neutral-600 mb-1">Active Items Sold</p>
                <p className="text-3xl font-semibold">{activeItemsSold}</p>
                <p className="text-xs text-neutral-500 mt-1">{todaysOrders.length} orders today</p>
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
                <p className="text-sm text-neutral-600 mb-1">Cancelled &amp; Restocked</p>
                <p className="text-3xl font-semibold text-red-600">{cancelledOrders.length}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {restockedUnits} units restored to stock (₹{totalCancelledValue.toLocaleString()})
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Payment Methods (Active)</h3>
            {Object.keys(paymentBreakdown).length === 0 ? (
              <p className="text-sm text-neutral-600">No active orders yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(paymentBreakdown).map(([method, count]) => {
                  const Icon = paymentIcon(method.toLowerCase());
                  const percent = activeOrders.length > 0 ? Math.round((count / activeOrders.length) * 100) : 0;
                  return (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-neutral-600" />
                        <span className="text-sm font-medium">{method}</span>
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
            <h3 className="text-lg font-medium mb-4">Recent Orders Activity</h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-600">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const isCancelled = order.status.toLowerCase() === "cancelled";
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-medium truncate">{order.id}</p>
                          <Badge
                            className={`rounded-none text-[10px] ${
                              isCancelled
                                ? "bg-red-600"
                                : order.status === "confirmed"
                                ? "bg-green-600"
                                : "bg-amber-500"
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-600 truncate mt-0.5">{order.fullName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium tabular-nums">₹{order.total.toLocaleString()}</p>
                        <p className="text-xs text-neutral-500 tabular-nums">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

