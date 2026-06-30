"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
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
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import type { AdminCategory } from "@/lib/db/categories";

type CategoryManagementProps = {
  categories: AdminCategory[];
  onRefresh: () => Promise<void>;
};

export function CategoryManagement({ categories, onRefresh }: CategoryManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<AdminCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({ name: "", description: "" });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: AdminCategory) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add category");
      }

      await onRefresh();
      toast.success("Category added successfully");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add category");
    }
  };

  const handleUpdate = async () => {
    if (!currentCategory) return;

    if (!formData.name) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${currentCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update category");
      }

      await onRefresh();
      toast.success("Category updated successfully");
      setIsEditDialogOpen(false);
      setCurrentCategory(null);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find((c) => c.id === id);

    if (category && category.productCount > 0) {
      toast.error(
        `Cannot delete category with ${category.productCount} products. Please reassign or delete products first.`,
      );
      setDeleteCategoryId(null);
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete category");
      }

      await onRefresh();
      toast.success("Category deleted successfully");
      setDeleteCategoryId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  const renderCategoryForm = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="categoryName" className="text-sm font-medium">
          Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="categoryName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Hoodies"
          className="rounded-none border-neutral-300 h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryDescription" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="categoryDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category..."
          className="rounded-none border-neutral-300 min-h-[88px] resize-none"
          rows={3}
        />
      </div>
    </div>
  );

  const renderCategoryDialog = ({
    open,
    onOpenChange,
    title,
    description,
    submitLabel,
    onSubmit,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    submitLabel: string;
    onSubmit: () => void;
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 rounded-none border-neutral-200 overflow-hidden">
        <div className="px-6 pt-6 pb-5 border-b border-neutral-100">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-xl font-serif font-normal">{title}</DialogTitle>
            <DialogDescription className="text-neutral-600">{description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          {renderCategoryForm()}
        </div>

        <DialogFooter className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none border-neutral-300 min-w-[96px]"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-black text-white hover:bg-neutral-800 rounded-none min-w-[120px]"
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-5">
      <Card className="border-neutral-200 rounded-none shadow-none">
        <CardContent className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-100">
                <FolderOpen className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium leading-tight">Product Categories</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Manage product categories and classifications
                </p>
              </div>
            </div>
            <Button
              className="bg-black text-white hover:bg-neutral-800 rounded-none shrink-0 w-full sm:w-auto"
              onClick={openAddDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 rounded-none shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[44%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-neutral-300 bg-amber-50">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900">
                    Category Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-900">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-neutral-900">Products</th>
                  <th className="px-4 py-3 text-center font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50/80 align-top"
                  >
                    <td className="px-4 py-3.5 font-medium text-neutral-900">{category.name}</td>
                    <td className="px-4 py-3.5 text-neutral-600 leading-snug">
                      <p className="line-clamp-2 break-words whitespace-normal">
                        {category.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="outline" className="rounded-none text-[11px] font-normal">
                        {category.productCount}{" "}
                        {category.productCount === 1 ? "product" : "products"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8 rounded-none hover:bg-neutral-100"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCategoryId(category.id)}
                          className="h-8 w-8 rounded-none text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-40"
                          disabled={category.productCount > 0}
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {renderCategoryDialog({
        open: isAddDialogOpen,
        onOpenChange: setIsAddDialogOpen,
        title: "Add New Category",
        description: "Create a new product category",
        submitLabel: "Add Category",
        onSubmit: handleAdd,
      })}

      {renderCategoryDialog({
        open: isEditDialogOpen,
        onOpenChange: setIsEditDialogOpen,
        title: "Edit Category",
        description: "Update the category details",
        submitLabel: "Save Changes",
        onSubmit: handleUpdate,
      })}

      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent className="rounded-none max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
              {(categories.find((c) => c.id === deleteCategoryId)?.productCount ?? 0) > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This category contains products and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3">
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

      <p className="text-sm text-neutral-500 pt-1">
        Total categories: <span className="font-medium text-neutral-700">{categories.length}</span>
      </p>
    </div>
  );
}
