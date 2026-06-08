"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { inventoryData } from "@/data/inventory";
import { Package, AlertTriangle, TrendingUp, Search, Download, BarChart3, FolderOpen } from "lucide-react";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { InventoryOverview } from "@/components/admin/InventoryOverview";
import type { InventoryItem } from "@/data/inventory";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredInventory = inventoryData.filter((item) => {
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

  const totalInventoryValue = inventoryData.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalQuantity = inventoryData.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventoryData.filter((item) => item.quantity < 25).length;
  const categories = ["All", "T-Shirts", "Polo Shirts", "Heavy Jersey"];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif mb-2">Inventory Management</h1>
        <p className="text-neutral-600">Manage products, categories, and track inventory</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 rounded-none">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderOpen className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="stock">
            <TrendingUp className="h-4 w-4 mr-2" />
            Stock Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
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
            totalInventoryValue={totalInventoryValue}
            totalQuantity={totalQuantity}
            lowStockItems={lowStockItems}
            categories={categories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StockDetailsTab({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filteredInventory,
  totalInventoryValue,
  totalQuantity,
  lowStockItems,
  categories,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filteredInventory: InventoryItem[];
  totalInventoryValue: number;
  totalQuantity: number;
  lowStockItems: number;
  categories: string[];
}) {
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

      <Card className="border-neutral-200 rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quality</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">S</TableHead>
                  <TableHead className="text-center">M</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">XL</TableHead>
                  <TableHead className="text-center">Total Qty</TableHead>
                  <TableHead className="text-right">Price/Unit</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">MRP</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item, index) => (
                  <TableRow key={index} className="hover:bg-neutral-50">
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="text-sm">{item.quality}</div>
                    </TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{item.sizes.S}</TableCell>
                    <TableCell className="text-center">{item.sizes.M}</TableCell>
                    <TableCell className="text-center">{item.sizes.L}</TableCell>
                    <TableCell className="text-center">{item.sizes.XL}</TableCell>
                    <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.pricePerUnit.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{item.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-neutral-500">
                      ₹{item.mrp.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {item.quantity < 25 ? (
                        <Badge variant="destructive" className="rounded-none">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="default" className="rounded-none bg-green-600">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        Showing {filteredInventory.length} of {inventoryData.length} items
      </div>
    </div>
  );
}
