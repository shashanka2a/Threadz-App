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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  RotateCcw,
  XCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminOrder } from "@/lib/db/admin-orders";
import { ShipmentPanel } from "@/components/admin/shipment-panel";
import { computeCheckoutTotals, formatInr } from "@/lib/pricing";
import { InitiateRefundDialog } from "@/components/admin/InitiateRefundDialog";

type OrdersTableProps = {
  orders: AdminOrder[];
  onRefresh?: () => void;
  defaultView?: "active" | "cancelled" | "all";
  hideViewTabs?: boolean;
};

type ViewMode = "active" | "cancelled" | "all";

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

function AdminOrderTotals({ order }: { order: AdminOrder }) {
  const { tax, quotedDelivery } = computeCheckoutTotals(
    order.total,
    order.shippingCost
  );

  return (
    <div className="border border-neutral-200 bg-white p-4 shrink-0 w-full lg:w-[260px]">
      <p className="font-medium text-sm mb-3">Order totals</p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-6">
          <dt className="text-neutral-600">Products</dt>
          <dd className="font-medium tabular-nums">{formatInr(order.total)}</dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="text-neutral-600">GST (18%, included)</dt>
          <dd className="tabular-nums">{formatInr(tax)}</dd>
        </div>
        {quotedDelivery > 0 && (
          <div className="flex items-center justify-between gap-6">
            <dt className="text-neutral-600">Delivery fee</dt>
            <dd className="text-neutral-400 line-through tabular-nums">
              {formatInr(quotedDelivery)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-6 border-t border-neutral-200 pt-2 font-medium">
          <dt>Total paid</dt>
          <dd className="tabular-nums">{formatInr(order.total)}</dd>
        </div>
      </dl>
      {quotedDelivery > 0 && (
        <p className="text-xs text-neutral-500 mt-2">Free delivery for customer</p>
      )}
    </div>
  );
}

export function OrdersTable({
  orders,
  onRefresh,
  defaultView = "active",
  hideViewTabs = false,
}: OrdersTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState("All");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status.toLowerCase() !== "cancelled"),
    [orders]
  );
  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status.toLowerCase() === "cancelled"),
    [orders]
  );

  const currentDataset = useMemo(() => {
    switch (viewMode) {
      case "active":
        return activeOrders;
      case "cancelled":
        return cancelledOrders;
      case "all":
      default:
        return orders;
    }
  }, [viewMode, activeOrders, cancelledOrders, orders]);

  const paymentMethods = useMemo(() => {
    const methods = new Set(orders.map((order) => order.paymentMethod.toUpperCase()));
    return ["All", ...Array.from(methods).sort()];
  }, [orders]);

  const filteredOrders = currentDataset.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      order.fullName.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.includes(query);
    const matchesPayment =
      filterPayment === "All" ||
      order.paymentMethod.toUpperCase() === filterPayment.toUpperCase();
    return matchesSearch && matchesPayment;
  });

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalUnits = filteredOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const handleAdminCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const res = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}/cancel`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to cancel order");
      }
      toast.success(data.message ?? `Order #${orderId} was cancelled and inventory restocked.`);
      onRefresh?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleExport = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Date",
      "Payment Method",
      "Status",
      "Total (INR)",
      "Items Count",
      "Restocked Inventory Breakdown",
    ];

    const rows = filteredOrders.map((order) => [
      `"${order.id}"`,
      `"${order.fullName.replace(/"/g, '""')}"`,
      `"${order.email}"`,
      `"${order.phone}"`,
      `"${order.createdAt}"`,
      `"${order.paymentMethod}"`,
      `"${order.status}"`,
      order.total,
      order.items.reduce((sum, item) => sum + item.quantity, 0),
      `"${order.items
        .map((item) => `${item.quantity}x ${item.productName} (${item.size})`)
        .join("; ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders-${viewMode}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Top Level Section Navigation / View Tabs */}
      {!hideViewTabs && (
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
          <Button
            variant={viewMode === "active" ? "default" : "outline"}
            size="sm"
            className="rounded-none gap-2 font-medium"
            onClick={() => setViewMode("active")}
          >
            <CheckCircle2 className="h-4 w-4" />
            Active Orders
            <Badge
              variant="secondary"
              className={`rounded-none text-xs ml-1 ${
                viewMode === "active" ? "bg-black/20 text-white" : "bg-neutral-100"
              }`}
            >
              {activeOrders.length}
            </Badge>
          </Button>

          <Button
            variant={viewMode === "cancelled" ? "default" : "outline"}
            size="sm"
            className="rounded-none gap-2 font-medium"
            onClick={() => setViewMode("cancelled")}
          >
            <RotateCcw className="h-4 w-4" />
            Cancelled Orders (Restocked)
            <Badge
              variant="secondary"
              className={`rounded-none text-xs ml-1 ${
                viewMode === "cancelled" ? "bg-black/20 text-white" : "bg-neutral-100"
              }`}
            >
              {cancelledOrders.length}
            </Badge>
          </Button>

          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-none gap-2 font-medium"
            onClick={() => setViewMode("all")}
          >
            <ListFilter className="h-4 w-4" />
            All Orders Archive
            <Badge
              variant="secondary"
              className={`rounded-none text-xs ml-1 ${
                viewMode === "all" ? "bg-black/20 text-white" : "bg-neutral-100"
              }`}
            >
              {orders.length}
            </Badge>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">
              {viewMode === "cancelled"
                ? "Cancelled Orders"
                : viewMode === "active"
                ? "Active Orders"
                : "Filtered Orders"}
            </p>
            <p className="text-2xl font-semibold">{filteredOrders.length}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {totalUnits} units total {viewMode === "cancelled" ? "restocked" : "allocated"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">
              {viewMode === "cancelled" ? "Restocked Order Value" : "Gross Order Value"}
            </p>
            <p className="text-2xl font-semibold">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {viewMode === "cancelled"
                ? "Inventory released back to stock"
                : "Active revenue from filtered set"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">All Orders in Database</p>
            <p className="text-2xl font-semibold">{orders.length}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {activeOrders.length} active · {cancelledOrders.length} cancelled
            </p>
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
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-none border-neutral-300">
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
            <Button
              variant="outline"
              className="rounded-none border-neutral-300"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 rounded-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="bg-amber-50 hover:bg-amber-50 border-b border-neutral-300">
                  <TableHead className="w-10 bg-amber-50 font-semibold text-neutral-900" />
                  <TableHead className="bg-amber-50 font-semibold text-neutral-900">
                    Order ID
                  </TableHead>
                  <TableHead className="bg-amber-50 font-semibold text-neutral-900">
                    Customer
                  </TableHead>
                  <TableHead className="bg-amber-50 font-semibold text-neutral-900">Date</TableHead>
                  <TableHead className="bg-amber-50 font-semibold text-neutral-900">
                    Payment
                  </TableHead>
                  {viewMode === "cancelled" ? (
                    <TableHead className="bg-amber-50 font-semibold text-neutral-900">
                      Restocked Inventory Items
                    </TableHead>
                  ) : (
                    <TableHead className="bg-amber-50 text-center font-semibold text-neutral-900">
                      Items
                    </TableHead>
                  )}
                  <TableHead className="bg-amber-50 text-right font-semibold text-neutral-900">
                    Total
                  </TableHead>
                  <TableHead className="bg-amber-50 font-semibold text-neutral-900">Status</TableHead>
                  <TableHead className="bg-amber-50 font-semibold text-neutral-900 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const isCancelled = order.status.toLowerCase() === "cancelled";

                  return (
                    <Fragment key={order.id}>
                      <TableRow className={`hover:bg-neutral-50/80 align-top ${isCancelled ? "bg-red-50/20" : ""}`}>
                        <TableCell className="align-top">
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
                        <TableCell className="font-mono font-medium align-top whitespace-nowrap">
                          {order.id}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-sm leading-snug font-medium">{order.fullName}</div>
                          <div className="text-xs text-neutral-500 break-all">{order.email}</div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap align-top tabular-nums">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge variant="outline" className="rounded-none text-xs uppercase">
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>

                        {viewMode === "cancelled" ? (
                          <TableCell className="align-top">
                            <div className="flex flex-wrap gap-1 max-w-sm">
                              {order.items.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="secondary"
                                  className="rounded-none text-[11px] bg-red-50 text-red-800 border border-red-200"
                                >
                                  {item.quantity}x {item.productName} ({item.size})
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        ) : (
                          <TableCell className="text-center align-top tabular-nums">
                            {itemCount}
                          </TableCell>
                        )}

                        <TableCell className="text-right font-medium align-top tabular-nums">
                          ₹{order.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge
                            className={`rounded-none ${
                              order.status === "confirmed"
                                ? "bg-green-600"
                                : order.status === "cancelled"
                                ? "bg-red-600"
                                : "bg-amber-500"
                            }`}
                          >
                            {order.status === "cancelled" ? "Cancelled (Restocked)" : order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          {!isCancelled ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                                  disabled={cancellingOrderId === order.id}
                                >
                                  {cancellingOrderId === order.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      Cancel
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-none max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-serif text-xl">
                                    <AlertTriangle className="h-5 w-5 shrink-0" />
                                    Cancel Order #{order.id}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2 text-sm text-neutral-600 pt-2">
                                    <p>
                                      Canceling this order will change its status to <strong>cancelled</strong>, cancel any linked Delhivery shipment, and automatically restore all items back to the product stock.
                                    </p>
                                    <div className="bg-neutral-100 p-3 rounded-none text-xs text-neutral-800 font-mono">
                                      <strong>Items to Restock:</strong>
                                      <ul className="list-disc list-inside mt-1">
                                        {order.items.map((it) => (
                                          <li key={it.id}>
                                            {it.quantity}x {it.productName} ({it.size})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2 sm:gap-0 mt-3">
                                  <AlertDialogCancel className="rounded-none">Keep Active</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleAdminCancelOrder(order.id)}
                                    className="rounded-none bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Cancel &amp; Restock Inventory
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <InitiateRefundDialog order={order} onSuccess={onRefresh} />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                          <TableCell colSpan={9} className="p-0">
                            <div className="p-4 md:p-6 space-y-5">
                              {isCancelled && (
                                <div className="p-4 bg-red-100/70 border border-red-200 text-red-900 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex items-start gap-2">
                                    <RotateCcw className="h-4 w-4 mt-0.5 shrink-0 text-red-700" />
                                    <div>
                                      <p className="font-semibold">Order Cancelled &amp; Inventory Restocked</p>
                                      <p className="text-xs text-red-800">
                                        All {order.items.length} line items ({itemCount} units) were returned to stock. You can process an automated customer refund via Razorpay below.
                                      </p>
                                    </div>
                                  </div>
                                  <InitiateRefundDialog
                                    order={order}
                                    onSuccess={onRefresh}
                                    triggerButton={
                                      <Button
                                        size="sm"
                                        className="rounded-none bg-blue-600 text-white hover:bg-blue-700 text-xs shrink-0 gap-1.5"
                                      >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Initiate Razorpay Refund
                                      </Button>
                                    }
                                  />
                                </div>
                              )}

                              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                                <div className="min-w-0 flex-1 text-sm">
                                  <p className="font-medium mb-2">Shipping address</p>
                                  <p className="text-neutral-600 break-words leading-relaxed">
                                    {formatAddress(order)}
                                  </p>
                                  <p className="text-neutral-600 mt-2 tabular-nums">
                                    {order.phone}
                                  </p>
                                </div>
                                <AdminOrderTotals order={order} />
                              </div>

                              <ShipmentPanel
                                order={order}
                                shipment={order.shipment}
                                onUpdated={() => onRefresh?.()}
                              />

                              <div>
                                <p className="font-medium mb-2 text-sm">Line items</p>
                                <div className="border border-neutral-200 overflow-x-auto bg-white">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-amber-50 hover:bg-amber-50">
                                        <TableHead className="bg-amber-50 font-semibold">
                                          Product
                                        </TableHead>
                                        <TableHead className="bg-amber-50 font-semibold">
                                          Color
                                        </TableHead>
                                        <TableHead className="bg-amber-50 font-semibold">
                                          Size
                                        </TableHead>
                                        <TableHead className="bg-amber-50 text-center font-semibold">
                                          Qty
                                        </TableHead>
                                        <TableHead className="bg-amber-50 text-right font-semibold">
                                          Unit
                                        </TableHead>
                                        <TableHead className="bg-amber-50 text-right font-semibold">
                                          Line total
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell className="whitespace-normal break-words align-top text-sm font-medium">
                                            {item.productName}
                                          </TableCell>
                                          <TableCell className="whitespace-nowrap align-top">
                                            {item.color}
                                          </TableCell>
                                          <TableCell className="align-top tabular-nums font-mono">
                                            {item.size}
                                          </TableCell>
                                          <TableCell className="text-center align-top tabular-nums">
                                            {item.quantity}
                                          </TableCell>
                                          <TableCell className="text-right align-top tabular-nums">
                                            ₹{item.unitPrice.toLocaleString()}
                                          </TableCell>
                                          <TableCell className="text-right align-top tabular-nums font-medium">
                                            ₹{item.lineTotal.toLocaleString()}
                                          </TableCell>
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
              setFilterPayment("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      <div className="mt-6 text-sm text-neutral-600">
        Showing {filteredOrders.length} of {currentDataset.length} orders
      </div>
    </div>
  );
}
