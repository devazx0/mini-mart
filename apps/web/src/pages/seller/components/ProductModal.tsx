import { useState, type FormEvent } from "react";
import { ApiError } from "../../../api/client";
import type { SellerProduct, SellerProductInput } from "../../../api/types";
import { uploadProductImage } from "../../../api/uploads";
import { FormError, TextField } from "../../../components/ui";

interface FormState {
  name: string;
  price: string;
  oldPrice: string;
  stock: string;
  category: string;
  categorySlug: string;
  description: string;
  imageUrl: string;
  badge: string;
  storeName: string;
  storeLocation: string;
  freeDelivery: boolean;
  active: boolean;
}

function toForm(p?: SellerProduct | null): FormState {
  if (!p) {
    return {
      name: "",
      price: "",
      oldPrice: "",
      stock: "10",
      category: "Electronics",
      categorySlug: "electronics",
      description: "",
      imageUrl: "",
      badge: "",
      storeName: "",
      storeLocation: "",
      freeDelivery: false,
      active: true,
    };
  }
  return {
    name: p.name,
    price: String(p.price),
    oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
    stock: String(p.stock),
    category: p.category,
    categorySlug: p.categorySlug,
    description: p.description,
    imageUrl: p.imageUrl,
    badge: p.badge ?? "",
    storeName: p.storeName,
    storeLocation: p.storeLocation,
    freeDelivery: p.freeDelivery ?? false,
    active: p.active,
  };
}

export default function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: SellerProduct | null;
  onClose: () => void;
  onSave: (input: SellerProductInput) => Promise<SellerProduct>;
}) {
  const [form, setForm] = useState<FormState>(() => toForm(product));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const r = await uploadProductImage(file);
      set("imageUrl", r.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid number (>= 0)");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number (>= 0)");
      return;
    }
    const oldPrice = form.oldPrice.trim() === "" ? null : Number(form.oldPrice);
    if (oldPrice != null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
      setError("Original price must be a valid number (>= 0)");
      return;
    }

    const payload: SellerProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      oldPrice,
      stock,
      imageUrl: form.imageUrl.trim(),
      category: form.category.trim() || "general",
      categorySlug: form.categorySlug.trim() || "all",
      freeDelivery: form.freeDelivery,
      badge: form.badge.trim() === "" ? null : form.badge.trim(),
      storeName: form.storeName.trim() === "" ? undefined : form.storeName.trim(),
      storeLocation: form.storeLocation.trim() === "" ? undefined : form.storeLocation.trim(),
      active: form.active,
    };

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl border border-surface-container-high/60 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container px-6 py-4 bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">
                {product ? "edit_note" : "add_business"}
              </span>
            </div>
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-on-surface">
                {product ? "Edit Product" : "Create New Product"}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {product ? "Update pricing, stock, and details" : "Add item to your store catalog"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-5 gap-4">
          <TextField
            id="p-name"
            label="Product Title"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              id="p-price"
              label="Selling Price (₦)"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="45000"
              required
            />
            <TextField
              id="p-old"
              label="Original / List Price (optional)"
              type="number"
              min={0}
              value={form.oldPrice}
              onChange={(e) => set("oldPrice", e.target.value)}
              placeholder="52000"
              hint="Shows strike-through discount"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              id="p-stock"
              label="Available Stock"
              type="number"
              min={0}
              step={1}
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              hint="0 = marked out of stock"
              required
            />
            <TextField
              id="p-badge"
              label="Promotional Badge (optional)"
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="e.g. Best Seller, -15% OFF"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              id="p-cat"
              label="Display Category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Electronics"
            />
            <TextField
              id="p-catslug"
              label="Category Slug"
              value={form.categorySlug}
              onChange={(e) => set("categorySlug", e.target.value)}
              placeholder="electronics"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-desc" className="text-xs font-semibold uppercase tracking-wider text-on-surface">
              Product Description
            </label>
            <textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Describe specifications, condition, warranty..."
              className="w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-sm outline-none ring-1 ring-inset ring-outline-variant/60 focus:ring-2 focus:ring-primary placeholder:text-outline"
            />
          </div>

          {/* Product Image Section */}
          <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low/60 p-3.5 border border-surface-container">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface">
              Product Image
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-surface-container px-3 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Choose File
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void onFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
              {uploading && (
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  Uploading…
                </span>
              )}
            </div>
            <input
              id="p-img"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="Or paste image URL (https://... or /uploads/...)"
              className="h-10 w-full rounded-lg bg-surface-container-lowest px-3 text-xs outline-none ring-1 ring-inset ring-outline-variant/60 focus:ring-2 focus:ring-primary"
            />
            {form.imageUrl && (
              <div className="relative mt-1 h-24 w-24 overflow-hidden rounded-xl border border-surface-container bg-surface-container">
                <img src={form.imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              id="p-store"
              label="Store Brand (optional)"
              value={form.storeName}
              onChange={(e) => set("storeName", e.target.value)}
              placeholder="Defaults to your store"
            />
            <TextField
              id="p-loc"
              label="Location (optional)"
              value={form.storeLocation}
              onChange={(e) => set("storeLocation", e.target.value)}
              placeholder="e.g. Lagos, Abuja"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low/40 p-3">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.freeDelivery}
                onChange={(e) => set("freeDelivery", e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span className="font-medium text-on-surface">Offer Free Delivery</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <div>
                <span className="font-medium text-on-surface">Listed on Storefront</span>
                <p className="text-xs text-on-surface-variant">Uncheck to hide without deleting</p>
              </div>
            </label>
          </div>

          {error && <FormError message={error} />}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex h-10 items-center justify-center gap-1.5 px-5 rounded-xl bg-primary text-xs font-semibold text-on-primary shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  Saving…
                </>
              ) : product ? (
                "Save Changes"
              ) : (
                "Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
