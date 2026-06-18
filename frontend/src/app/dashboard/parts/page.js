"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

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

  if (loading) return <div className="text-muted p-4">Loading parts...</div>;
  if (error) return <div className="text-error p-4">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Parts Inventory</h1>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            + Add Part
          </button>
        )}
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-card-border/30 text-muted uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">No parts found.</td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-card-border/10 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{part.name}</p>
                      {part.description && <p className="text-xs text-muted mt-0.5">{part.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-muted">{part.category?.name || "Unknown"}</td>
                    <td className="px-6 py-4 font-medium">₹{(part.currentPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      {part.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error/10 text-error">Inactive</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(part)} className="text-primary hover:text-primary-hover text-sm font-medium mr-4 cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(part.id)} className="text-error hover:text-error/80 text-sm font-medium cursor-pointer">Delete</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-card-border rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-medium mb-4">{modalMode === "create" ? "Add Part" : "Edit Part"}</h2>
            
            {formError && (
              <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Part Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-input-focus/50 focus:border-input-focus transition-all"
                  placeholder="e.g. Off-Road Tyre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-input-focus/50 focus:border-input-focus transition-all appearance-none"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-input-focus/50 focus:border-input-focus transition-all"
                  placeholder="e.g. 1500.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-input-focus/50 focus:border-input-focus transition-all resize-none"
                  rows={2}
                  placeholder="Brief details about the part"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary bg-input-bg"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-muted">Part is active and available for quotes</label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-card-border/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
