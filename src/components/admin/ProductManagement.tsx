"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Edit, Trash2, Search, Upload, X, Image as ImageIcon } from "lucide-react";
import { Product } from "../../types/product";
import { products as initialProducts, categories as initialCategories } from "../../data/products";
import { QUALITY_OPTIONS, getRetailPrice } from "../../data/categories";
import { toast } from "sonner";

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories] = useState<string[]>(initialCategories.filter(c => c !== "All Products"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quality: "",
    color: "",
    price: "",
    mrp: "",
    image: "",
    category: "",
    gsm: "",
    sizeS: "",
    sizeM: "",
    sizeL: "",
    sizeXL: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      quality: "",
      color: "",
      price: "",
      mrp: "",
      image: "",
      category: "",
      gsm: "",
      sizeS: "",
      sizeM: "",
      sizeL: "",
      sizeXL: "",
    });
    setImagePreview("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      quality: product.quality,
      color: product.color,
      price: product.price.toString(),
      mrp: product.mrp.toString(),
      image: product.image,
      category: product.category,
      gsm: product.gsm,
      sizeS: "6",
      sizeM: "6",
      sizeL: "6",
      sizeXL: "6",
    });
    setImagePreview(product.image);
    setIsEditDialogOpen(true);
  };

  const buildSizeStock = () => ({
    S: parseInt(formData.sizeS || "0"),
    M: parseInt(formData.sizeM || "0"),
    L: parseInt(formData.sizeL || "0"),
    XL: parseInt(formData.sizeXL || "0"),
  });

  const handleAdd = () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const sizeStock = buildSizeStock();

    const newProduct: Product = {
      id: (products.length + 1).toString(),
      name: formData.name,
      description: formData.description,
      quality: formData.quality,
      color: formData.color,
      price: parseFloat(formData.price),
      mrp: parseFloat(formData.mrp),
      image: formData.image || "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      category: formData.category as Product["category"],
      gsm: formData.gsm,
      sizes: ["S", "M", "L", "XL"],
      quantity: sizeStock.S + sizeStock.M + sizeStock.L + sizeStock.XL,
      sizeStock,
    };

    setProducts([...products, newProduct]);
    toast.success("Product added successfully");
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!currentProduct) return;

    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const sizeStock = buildSizeStock();

    const updatedProducts = products.map((p) =>
      p.id === currentProduct.id
        ? {
            ...p,
            name: formData.name,
            description: formData.description,
            quality: formData.quality,
            color: formData.color,
            price: parseFloat(formData.price),
            mrp: parseFloat(formData.mrp),
            image: formData.image,
            category: formData.category as Product["category"],
            gsm: formData.gsm,
            quantity: sizeStock.S + sizeStock.M + sizeStock.L + sizeStock.XL,
            sizeStock,
          }
        : p
    );

    setProducts(updatedProducts);
    toast.success("Product updated successfully");
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Product deleted successfully");
    setDeleteProductId(null);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProductForm = () => (
    <div className="grid gap-6 py-4">
      {/* Image Upload Section */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Product Image</Label>
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {imagePreview ? (
              <div className="relative w-32 h-32 border-2 border-neutral-200 rounded overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImagePreview("");
                    setFormData({ ...formData, image: "" });
                  }}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-neutral-300 rounded flex items-center justify-center bg-neutral-50">
                <ImageIcon className="h-8 w-8 text-neutral-400" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-300 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Upload Image</span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-neutral-500 mt-2">JPG, PNG or WEBP (Max 2MB)</p>
            </div>
            <div className="text-xs text-neutral-500">or</div>
            <div>
              <Input
                placeholder="Enter image URL"
                value={formData.image.startsWith('data:') ? '' : formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                className="rounded-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-neutral-200" />

      {/* Basic Information */}
      <div>
        <h4 className="text-sm font-medium mb-3">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Premium Cotton T-Shirt"
              className="rounded-none mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="color" className="text-sm">Color *</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Charcoal Melange"
              className="rounded-none mt-1.5"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Product description..."
          className="rounded-none mt-1.5"
          rows={3}
        />
      </div>

      <div className="h-px bg-neutral-200" />

      {/* Category & Specifications */}
      <div>
        <h4 className="text-sm font-medium mb-3">Category & Specifications</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-sm">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="rounded-none mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gsm" className="text-sm">GSM</Label>
            <Input
              id="gsm"
              value={formData.gsm}
              onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
              placeholder="180 GSM"
              className="rounded-none mt-1.5"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="quality" className="text-sm">Quality / Fabric</Label>
          <Select
            value={formData.quality}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                quality: value,
                price: String(getRetailPrice(value)),
              })
            }
          >
            <SelectTrigger className="rounded-none mt-1.5">
              <SelectValue placeholder="Select fabric quality" />
            </SelectTrigger>
            <SelectContent>
              {QUALITY_OPTIONS.map((quality) => (
                <SelectItem key={quality} value={quality}>
                  {quality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-px bg-neutral-200" />

      {/* Pricing */}
      <div>
        <h4 className="text-sm font-medium mb-3">Pricing</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="text-sm">Selling Price *</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="499"
                className="rounded-none pl-7"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="mrp" className="text-sm">MRP *</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
              <Input
                id="mrp"
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                placeholder="899"
                className="rounded-none pl-7"
              />
            </div>
          </div>
        </div>
        {formData.price && formData.mrp && parseFloat(formData.price) < parseFloat(formData.mrp) && (
          <p className="text-xs text-green-600 mt-2">
            {Math.round(((parseFloat(formData.mrp) - parseFloat(formData.price)) / parseFloat(formData.mrp)) * 100)}% discount
          </p>
        )}
      </div>

      <div className="h-px bg-neutral-200" />

      {/* Stock by Size */}
      <div>
        <h4 className="text-sm font-medium mb-3">Stock by Size</h4>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label htmlFor="sizeS" className="text-sm">S</Label>
            <Input
              id="sizeS"
              type="number"
              value={formData.sizeS}
              onChange={(e) => setFormData({ ...formData, sizeS: e.target.value })}
              placeholder="0"
              className="rounded-none mt-1.5"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="sizeM" className="text-sm">M</Label>
            <Input
              id="sizeM"
              type="number"
              value={formData.sizeM}
              onChange={(e) => setFormData({ ...formData, sizeM: e.target.value })}
              placeholder="0"
              className="rounded-none mt-1.5"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="sizeL" className="text-sm">L</Label>
            <Input
              id="sizeL"
              type="number"
              value={formData.sizeL}
              onChange={(e) => setFormData({ ...formData, sizeL: e.target.value })}
              placeholder="0"
              className="rounded-none mt-1.5"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="sizeXL" className="text-sm">XL</Label>
            <Input
              id="sizeXL"
              type="number"
              value={formData.sizeXL}
              onChange={(e) => setFormData({ ...formData, sizeXL: e.target.value })}
              placeholder="0"
              className="rounded-none mt-1.5"
              min="0"
            />
          </div>
        </div>
        {(formData.sizeS || formData.sizeM || formData.sizeL || formData.sizeXL) && (
          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              Total Stock: <span className="font-medium">
                {(parseInt(formData.sizeS || "0") + parseInt(formData.sizeM || "0") +
                  parseInt(formData.sizeL || "0") + parseInt(formData.sizeXL || "0"))} units
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <Card className="border-neutral-200 rounded-none mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-none border-neutral-300"
              />
            </div>
            <Button
              className="bg-black text-white hover:bg-neutral-800 rounded-none"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new product to your inventory
                  </DialogDescription>
                </DialogHeader>
                <ProductForm />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-none">
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} className="bg-black text-white hover:bg-neutral-800 rounded-none">
                    Add Product
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">MRP</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.color}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] text-xs text-neutral-600">
                      {product.quality}
                    </TableCell>
                    <TableCell className="text-right">₹{product.price}</TableCell>
                    <TableCell className="text-right text-neutral-500">₹{product.mrp}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.quantity < 25 ? "destructive" : "default"}
                        className="rounded-none"
                      >
                        {product.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteProductId(product.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details
            </DialogDescription>
          </DialogHeader>
          <ProductForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-black text-white hover:bg-neutral-800 rounded-none">
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDelete(deleteProductId)}
              className="bg-red-600 hover:bg-red-700 rounded-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600">No products found.</p>
        </div>
      )}

      <div className="mt-6 text-sm text-neutral-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
