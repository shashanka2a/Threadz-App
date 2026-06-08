"use client";

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
import { Package, AlertTriangle, TrendingUp, Search, Download } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

type StockDetailsTabProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filteredInventory: InventoryItem[];
  totalInventory: InventoryItem[];
  totalInventoryValue: number;
  totalQuantity: number;
  lowStockItems: number;
  categories: string[];
};

export function StockDetailsTab({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filteredInventory,
  totalInventory,
  totalInventoryValue,
  totalQuantity,
  lowStockItems,
  categories,
}: StockDetailsTabProps) {
  const filteredTotalQty = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-neutral-200 rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Inventory Value</p>
                <p className="text-2xl">₹{totalInventoryValue.toLocaleString()}</p>
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
                <p className="text-sm text-neutral-600 mb-1">Total Units</p>
                <p className="text-2xl">{totalQuantity}</p>
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
                <p className="text-sm text-neutral-600 mb-1">Low Stock Items</p>
                <p className="text-2xl">{lowStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
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
                  placeholder="Search by color or quality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-none border-neutral-300"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v)}>
              <SelectTrigger className="w-[180px] rounded-none border-neutral-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v)}>
              <SelectTrigger className="w-[180px] rounded-none border-neutral-300">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-none border-neutral-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 rounded-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[4%]" />
                <col className="w-[6%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-neutral-300 bg-amber-50">
                  <th className="px-3 py-3 text-left font-semibold text-neutral-900">Quality</th>
                  <th className="px-3 py-3 text-left font-semibold text-neutral-900">Color</th>
                  <th className="px-3 py-3 text-left font-semibold text-neutral-900">Category</th>
                  <th className="px-2 py-3 text-center font-semibold text-neutral-900">S</th>
                  <th className="px-2 py-3 text-center font-semibold text-neutral-900">M</th>
                  <th className="px-2 py-3 text-center font-semibold text-neutral-900">L</th>
                  <th className="px-2 py-3 text-center font-semibold text-neutral-900">XL</th>
                  <th className="px-2 py-3 text-center font-semibold text-neutral-900">Total Qty</th>
                  <th className="px-3 py-3 text-right font-semibold text-neutral-900">Price/Unit</th>
                  <th className="px-3 py-3 text-right font-semibold text-neutral-900">Total Value</th>
                  <th className="px-3 py-3 text-right font-semibold text-neutral-900">MRP</th>
                  <th className="px-3 py-3 text-left font-semibold text-neutral-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50/80 align-top"
                  >
                    <td className="px-3 py-3 text-sm leading-snug break-words whitespace-normal text-neutral-800">
                      {item.quality}
                    </td>
                    <td className="px-3 py-3 font-medium whitespace-nowrap text-neutral-900">
                      {item.color}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className="rounded-none text-[10px] whitespace-normal">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-center tabular-nums">{item.sizes.S}</td>
                    <td className="px-2 py-3 text-center tabular-nums">{item.sizes.M}</td>
                    <td className="px-2 py-3 text-center tabular-nums">{item.sizes.L}</td>
                    <td className="px-2 py-3 text-center tabular-nums">{item.sizes.XL}</td>
                    <td className="px-2 py-3 text-center font-semibold tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      ₹{item.pricePerUnit.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">
                      ₹{item.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-neutral-500">
                      ₹{item.mrp.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      {item.quantity < 25 ? (
                        <Badge variant="destructive" className="rounded-none text-[10px]">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="rounded-none bg-green-600 text-[10px] hover:bg-green-600">
                          In Stock
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50 border-t border-neutral-300 font-semibold">
                  <td colSpan={7} className="px-3 py-3 text-right text-neutral-700">
                    Grand Total
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">{filteredTotalQty}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600">No inventory items found matching your filters.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-none"
            onClick={() => {
              setSearchQuery("");
              setFilterCategory("All");
              setFilterStatus("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      <div className="mt-6 text-sm text-neutral-600">
        Showing {filteredInventory.length} of {totalInventory.length} items
      </div>
    </div>
  );
}
