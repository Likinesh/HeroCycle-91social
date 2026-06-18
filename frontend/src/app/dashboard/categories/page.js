"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [currentCat, setCurrentCat] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: "", isRequired: true, requiredQuantity: 1 });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

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
      fetchCategories();
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
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category.");
    }
  }

  if (loading) return <div className="text-muted p-4">Loading categories...</div>;
  if (error) return <div className="text-error p-4">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            + Add Category
          </button>
        )}
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-card-border/30 text-muted uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Required</th>
                <th className="px-6 py-4 font-medium">Req. Quantity</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">No categories found.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-card-border/10 transition-colors">
                    <td className="px-6 py-4 font-medium">{cat.name}</td>
                    <td className="px-6 py-4">
                      {cat.isRequired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">Yes</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted/20 text-muted">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted">{cat.requiredQuantity}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(cat)} className="text-primary hover:text-primary-hover text-sm font-medium mr-4 cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(cat.id)} className="text-error hover:text-error/80 text-sm font-medium cursor-pointer">Delete</button>
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
            <h2 className="text-lg font-medium mb-4">{modalMode === "create" ? "Add Category" : "Edit Category"}</h2>
            
            {formError && (
              <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-input-bg border border-input-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-input-focus/50 focus:border-input-focus transition-all"
                  placeholder="e.g. Frame"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary bg-input-bg"
                />
                <label htmlFor="isRequired" className="text-sm font-medium text-muted">Is this category required in a configuration?</label>
              </div>

              {formData.isRequired && (
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Required Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.requiredQuantity}
                    onChange={(e) => setFormData({ ...formData, requiredQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-input-bg border border-input-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-input-focus/50 focus:border-input-focus transition-all"
                  />
                </div>
              )}

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
