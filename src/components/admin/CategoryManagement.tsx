"use client";

import { useState } from "react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "T-Shirts", description: "Classic cotton t-shirts", productCount: 6 },
    { id: "2", name: "Polo Shirts", description: "Premium polo shirts", productCount: 3 },
    { id: "3", name: "Heavy Jersey", description: "Oversized heavy jersey t-shirts", productCount: 4 },
    { id: "4", name: "Interlock", description: "Soft interlock cotton apparel", productCount: 0 },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    const newCategory: Category = {
      id: (categories.length + 1).toString(),
      name: formData.name,
      description: formData.description,
      productCount: 0,
    };

    setCategories([...categories, newCategory]);
    toast.success("Category added successfully");
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!currentCategory) return;

    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    const updatedCategories = categories.map((c) =>
      c.id === currentCategory.id
        ? {
            ...c,
            name: formData.name,
            description: formData.description,
          }
        : c
    );

    setCategories(updatedCategories);
    toast.success("Category updated successfully");
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const category = categories.find((c) => c.id === id);

    if (category && category.productCount > 0) {
      toast.error(`Cannot delete category with ${category.productCount} products. Please reassign or delete products first.`);
      setDeleteCategoryId(null);
      return;
    }

    setCategories(categories.filter((c) => c.id !== id));
    toast.success("Category deleted successfully");
    setDeleteCategoryId(null);
  };

  const CategoryForm = () => (
    <div className="grid gap-4 py-4">
      <div>
        <Label htmlFor="categoryName">Category Name *</Label>
        <Input
          id="categoryName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Hoodies"
          className="rounded-none"
        />
      </div>

      <div>
        <Label htmlFor="categoryDescription">Description</Label>
        <Textarea
          id="categoryDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category..."
          className="rounded-none"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Card className="border-neutral-200 rounded-none mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-1">Product Categories</h3>
              <p className="text-sm text-neutral-600">Manage product categories and classifications</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <Button
                className="bg-black text-white hover:bg-neutral-800 rounded-none"
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <DialogContent className="max-w-lg rounded-none">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new product category
                  </DialogDescription>
                </DialogHeader>
                <CategoryForm />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-none">
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} className="bg-black text-white hover:bg-neutral-800 rounded-none">
                    Add Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 rounded-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-neutral-600">{category.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-none">
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCategoryId(category.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={category.productCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details
            </DialogDescription>
          </DialogHeader>
          <CategoryForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-none">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-black text-white hover:bg-neutral-800 rounded-none">
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
              {categories.find(c => c.id === deleteCategoryId)?.productCount! > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This category contains products and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && handleDelete(deleteCategoryId)}
              className="bg-red-600 hover:bg-red-700 rounded-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-6 text-sm text-neutral-600">
        Total categories: {categories.length}
      </div>
    </div>
  );
}
