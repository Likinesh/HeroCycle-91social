"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PartsPage() {
  const { user } = useAuth();
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [currentPart, setCurrentPart] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ 
    name: "", 
    categoryId: "", 
    description: "", 
    currentPrice: "", 
    isActive: true 
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [partsRes, catRes] = await Promise.all([
        api.get("/parts"),
        api.get("/categories")
      ]);
      setParts(partsRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode("create");
    setFormData({ 
      name: "", 
      categoryId: categories.length > 0 ? categories[0].id : "", 
      description: "", 
      currentPrice: "", // Represents Rupees in the UI
      isActive: true 
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(part) {
    setModalMode("edit");
    setCurrentPart(part);
    setFormData({ 
      name: part.name, 
      categoryId: part.categoryId, 
      description: part.description || "", 
      currentPrice: (part.currentPrice / 100).toString(), // Convert paise to Rupees for the UI
      isActive: part.isActive 
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      // Convert Rupees input to paise integer
      const payload = {
        ...formData,
        currentPrice: Math.round(parseFloat(formData.currentPrice) * 100)
      };

      if (modalMode === "create") {
        await api.post("/parts", payload);
      } else {
        await api.patch(`/parts/${currentPart.id}`, payload);
      }
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "An error occurred");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this part?")) return;
    
    try {
      await api.delete(`/parts/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete part.");
    }
  }

  if (loading) return <div className="text-muted-foreground p-4">Loading parts...</div>;
  if (error) return <div className="text-destructive p-4">{error}</div>;

  return (
    <>
      <PageHeader 
        title="Parts Inventory" 
        actionButton={
          isAdmin && <Button onClick={openCreateModal}>+ Add Part</Button>
        } 
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No parts found.</TableCell>
              </TableRow>
            ) : (
              parts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <p className="font-medium">{part.name}</p>
                    {part.description && <p className="text-xs text-muted-foreground mt-0.5">{part.description}</p>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{part.category?.name || "Unknown"}</TableCell>
                  <TableCell className="font-medium">₹{(part.currentPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    {part.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(part)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(part.id)}>Delete</Button>
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
            <DialogTitle>{modalMode === "create" ? "Add Part" : "Edit Part"}</DialogTitle>
          </DialogHeader>
          
          {formError && (
            <div className="bg-destructive/15 text-destructive text-sm rounded-md px-4 py-3 border border-destructive/20">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Off-Road Tyre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="e.g. 1500.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Brief details about the part"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Part is active and ready for use
              </Label>
            </div>

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
