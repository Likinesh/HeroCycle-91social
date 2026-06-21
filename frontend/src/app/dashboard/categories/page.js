"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CategoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categoriesRes, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get("/categories").then(res => res.data.data),
  });

  const categories = categoriesRes || [];
  const error = queryError ? "Failed to load categories." : "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [currentCat, setCurrentCat] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", isRequired: true, requiredQuantity: 1 });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  function openCreateModal() {
    setModalMode("create");
    setFormData({ name: "", isRequired: true, requiredQuantity: 1 });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(cat) {
    setModalMode("edit");
    setCurrentCat(cat);
    setFormData({ name: cat.name, isRequired: cat.isRequired, requiredQuantity: cat.requiredQuantity });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (modalMode === "create") {
        await api.post("/categories", formData);
      } else {
        await api.patch(`/categories/${currentCat.id}`, formData);
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "An error occurred");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      await api.delete(`/categories/${id}`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      alert("Failed to delete category.");
    }
  }

  if (loading) return <div className="text-muted-foreground p-4">Loading categories...</div>;
  if (error) return <div className="text-destructive p-4">{error}</div>;

  return (
    <>
      <PageHeader 
        title="Categories" 
        actionButton={
          isAdmin && <Button onClick={openCreateModal}>+ Add Category</Button>
        } 
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Req. Quantity</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No categories found.</TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    {cat.isRequired ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cat.requiredQuantity}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(cat)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Add Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>
          
          {formError && (
            <div className="bg-destructive/15 text-destructive text-sm rounded-md px-4 py-3 border border-destructive/20">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Frame"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isRequired"
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
              />
              <Label htmlFor="isRequired" className="text-sm font-normal">
                Is this category required in a configuration?
              </Label>
            </div>

            {formData.isRequired && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="qty">Required Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  required
                  value={formData.requiredQuantity}
                  onChange={(e) => setFormData({ ...formData, requiredQuantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
