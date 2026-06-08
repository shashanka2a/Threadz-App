"use client";

import { Fragment, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import type { AdminOrder } from "@/lib/db/admin-orders";

type OrdersTableProps = {
  orders: AdminOrder[];
};

function formatAddress(order: AdminOrder) {
  const parts = [
    order.addressLine1,
    order.addressLine2,
    `${order.city}, ${order.state} ${order.postalCode}`,
    order.country,
  ].filter(Boolean);
  return parts.join(", ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const paymentMethods = useMemo(() => {
    const methods = new Set(orders.map((order) => order.paymentMethod.toUpperCase()));
    return ["All", ...Array.from(methods).sort()];
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      order.fullName.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.includes(query);
    const matchesStatus =
      filterStatus === "All" || order.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPayment =
      filterPayment === "All" ||
      order.paymentMethod.toUpperCase() === filterPayment.toUpperCase();
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">Filtered Orders</p>
            <p className="text-2xl">{filteredOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">Filtered Revenue</p>
            <p className="text-2xl">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">All Orders</p>
            <p className="text-2xl">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200 rounded-none mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search by order ID, name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-none border-neutral-300"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] rounded-none border-neutral-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-[180px] rounded-none border-neutral-300">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-none border-neutral-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <Fragment key={order.id}>
                      <TableRow className="hover:bg-neutral-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="text-sm">{order.fullName}</div>
                          <div className="text-xs text-neutral-500">{order.email}</div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-none text-xs uppercase">
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{itemCount}</TableCell>
                        <TableCell className="text-right font-medium">₹{order.total}</TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-none ${
                              order.status === "confirmed"
                                ? "bg-green-600"
                                : order.status === "cancelled"
                                  ? "bg-red-600"
                                  : "bg-amber-500"
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-neutral-50">
                          <TableCell colSpan={8}>
                            <div className="py-4 px-2 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium mb-1">Shipping address</p>
                                  <p className="text-neutral-600">{formatAddress(order)}</p>
                                  <p className="text-neutral-600 mt-1">{order.phone}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Order totals</p>
                                  <p className="text-neutral-600">Subtotal: ₹{order.subtotal}</p>
                                  <p className="text-neutral-600">Tax: ₹{order.tax}</p>
                                  <p className="text-neutral-600 font-medium">Total: ₹{order.total}</p>
                                </div>
                              </div>

                              <div>
                                <p className="font-medium mb-2 text-sm">Line items</p>
                                <div className="border border-neutral-200">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Color</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Unit</TableHead>
                                        <TableHead className="text-right">Line total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.productName}</TableCell>
                                          <TableCell>{item.color}</TableCell>
                                          <TableCell>{item.size}</TableCell>
                                          <TableCell className="text-center">{item.quantity}</TableCell>
                                          <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                                          <TableCell className="text-right">₹{item.lineTotal}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600">No orders found matching your filters.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-none"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("All");
              setFilterPayment("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      <div className="mt-6 text-sm text-neutral-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  );
}
