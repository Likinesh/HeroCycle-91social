"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ConfigurationsPage() {
  const queryClient = useQueryClient();

  const { data: configRes, isLoading: configLoading, error: configError } = useQuery({
    queryKey: ['configurations'],
    queryFn: () => api.get("/configurations").then(res => res.data.data),
  });

  const { data: partsRes, isLoading: partsLoading, error: partsError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => api.get("/parts").then(res => res.data.data),
  });

  const { data: catRes, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get("/categories").then(res => res.data.data),
  });

  const configurations = configRes || [];
  const partsList = partsRes ? partsRes.filter(p => p.isActive) : [];
  const categories = catRes || [];
  const loading = configLoading || partsLoading || catLoading;
  const error = (configError || partsError || catError) ? "Failed to load configurations data." : "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentConfig, setCurrentConfig] = useState(null);

  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    basePrice: "", 
    isActive: true 
  });
  const [selectedParts, setSelectedParts] = useState([]); // [{ categoryId, categoryName, partId, quantity }]
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [breakdownConfig, setBreakdownConfig] = useState(null);

  function openCreateModal() {
    setModalMode("create");
    setFormData({ name: "", description: "", basePrice: "", isActive: true });
    
    // Pre-populate required categories
    const requiredCats = categories.filter(c => c.isRequired);
    const defaultParts = requiredCats.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      partId: "",
      quantity: cat.requiredQuantity
    }));
    
    setSelectedParts(defaultParts.length > 0 ? defaultParts : [{ categoryId: "", categoryName: "Optional Part", partId: "", quantity: 1 }]);
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(config) {
    setModalMode("edit");
    setCurrentConfig(config);
    setFormData({ 
      name: config.name, 
      description: config.description || "", 
      basePrice: (config.basePrice / 100).toString(), 
      isActive: config.isActive 
    });

    const existingParts = config.parts.map(cp => {
      const partInfo = partsList.find(p => p.id === cp.partId) || cp.part;
      return {
        categoryId: partInfo?.categoryId || "",
        categoryName: partInfo?.category?.name || "Part",
        partId: cp.partId,
        quantity: cp.quantity
      };
    });

    setSelectedParts(existingParts);
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    // Filter out incomplete parts
    const validParts = selectedParts.filter(p => p.partId && p.quantity > 0);
    if (validParts.length === 0) {
      setFormError("Please select at least one valid part.");
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        basePrice: Math.round(parseFloat(formData.basePrice || 0) * 100),
        parts: validParts.map(vp => ({ partId: vp.partId, quantity: vp.quantity }))
      };

      if (modalMode === "create") {
        await api.post("/configurations", payload);
      } else {
        await api.patch(`/configurations/${currentConfig.id}`, payload);
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
    } catch (err) {
      setFormError(err.response?.data?.error?.message || "An error occurred");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this configuration?")) return;
    try {
      await api.delete(`/configurations/${id}`);
      queryClient.invalidateQueries({ queryKey: ['configurations'] });
    } catch (err) {
      alert("Failed to delete configuration.");
    }
  }

  // Dynamic parts handling
  function addPartRow() {
    setSelectedParts([...selectedParts, { categoryId: "", categoryName: "Optional Part", partId: "", quantity: 1 }]);
  }

  function removePartRow(index) {
    const updated = [...selectedParts];
    updated.splice(index, 1);
    setSelectedParts(updated);
  }

  function updatePartRow(index, field, value) {
    const updated = [...selectedParts];
    updated[index][field] = value;
    
    // Automatically set the category if a part is selected in a generic row
    if (field === "partId") {
      const selectedPartData = partsList.find(p => p.id === value);
      if (selectedPartData && !updated[index].categoryId) {
        updated[index].categoryId = selectedPartData.categoryId;
        updated[index].categoryName = selectedPartData.category?.name || "Optional Part";
      }
    }
    
    setSelectedParts(updated);
  }

  if (loading) return <div className="text-muted-foreground p-4">Loading configurations...</div>;
  if (error) return <div className="text-destructive p-4">{error}</div>;

  return (
    <>
      <PageHeader 
        title="Bike Configurations" 
        actionButton={<Button onClick={openCreateModal}>+ Add Configuration</Button>} 
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configurations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No configurations found.</TableCell>
              </TableRow>
            ) : (
              configurations.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <p className="font-medium">{config.name}</p>
                    {config.description && <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{config.creator?.name || "Unknown"}</TableCell>
                  <TableCell className="text-muted-foreground">₹{(config.basePrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <div className="font-medium text-primary">₹{(config.totalPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <button 
                      onClick={() => setBreakdownConfig(config)}
                      className="text-[10px] text-muted-foreground hover:text-primary mt-0.5 underline cursor-pointer uppercase tracking-wider"
                    >
                      View Breakdown
                    </button>
                  </TableCell>
                  <TableCell>
                    {config.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(config)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(config.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Breakdown Modal */}
      <Dialog open={!!breakdownConfig} onOpenChange={(open) => !open && setBreakdownConfig(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Price Breakdown</DialogTitle>
            <p className="text-sm text-muted-foreground">{breakdownConfig?.name}</p>
          </DialogHeader>

          {breakdownConfig && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-medium">₹{(breakdownConfig.basePrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Components</h3>
                <div className="space-y-3">
                  {breakdownConfig.parts.map((cp, idx) => {
                    const part = partsList.find(p => p.id === cp.partId) || cp.part;
                    const unitPrice = part?.currentPrice || 0;
                    const subtotal = unitPrice * cp.quantity;
                    
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{part?.name || 'Unknown Part'}</span>
                          <span className="text-xs text-muted-foreground">{cp.quantity} x ₹{(unitPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <span className="font-medium text-muted-foreground">₹{(subtotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center bg-muted/30 -mx-6 px-6 pb-6 rounded-b-lg">
                <span className="font-semibold text-lg pt-4">Total Price</span>
                <span className="font-semibold text-2xl text-primary pt-4">₹{(breakdownConfig.totalPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setBreakdownConfig(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Build Configuration" : "Edit Configuration"}</DialogTitle>
          </DialogHeader>
          
          {formError && (
            <div className="bg-destructive/15 text-destructive text-sm rounded-md px-4 py-3 border border-destructive/20">
              {formError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard Commuter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="e.g. 500.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Details about this build"
              />
            </div>

            {/* Dynamic Parts List */}
            <div className="border rounded-lg p-4 bg-muted/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Included Parts</h3>
                <Button type="button" variant="secondary" size="sm" onClick={addPartRow}>+ Add Optional Part</Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {selectedParts.map((sp, index) => {
                  const availableOptions = sp.categoryId 
                    ? partsList.filter(p => p.categoryId === sp.categoryId)
                    : partsList;

                  return (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-xs mb-1 block">{sp.categoryName}</Label>
                        <select
                          required
                          value={sp.partId}
                          onChange={(e) => updatePartRow(index, "partId", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>Select {sp.categoryName}...</option>
                          {availableOptions.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (₹{p.currentPrice / 100})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <Label className="text-xs mb-1 block">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          required
                          value={sp.quantity}
                          onChange={(e) => updatePartRow(index, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePartRow(index)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer mb-1"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
                {selectedParts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No parts added yet.</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Configuration is active and ready for use
              </Label>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
