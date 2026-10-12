import { useMemo, useState } from "react";
import { formatNaira } from "../../api/seller";
import type { SellerProduct } from "../../api/types";
import { useSeller } from "./SellerContext";

type FilterStatus = "all" | "in_stock" | "low_stock" | "out_of_stock" | "unlisted";

function getStockBadge(p: SellerProduct): { text: string; cls: string } {
  if (!p.active) return { text: "Unlisted", cls: "bg-surface-container-high text-on-surface-variant" };
  if (p.stock <= 0) return { text: "Out of Stock", cls: "bg-error-container text-on-error-container" };
  if (p.stock <= 3)
    return { text: `Low Stock (${p.stock})`, cls: "bg-tertiary-fixed text-on-tertiary-fixed-variant" };
  return { text: `In Stock (${p.stock})`, cls: "bg-secondary-container text-on-secondary-container" };
}

export default function SellerProductsPage() {
  const {
    products,
    loading,
    error,
    busyId,
    openCreateProduct,
    openEditProduct,
    handleToggleActive,
    handleSetStock,
    handleDeleteProduct,
  } = useSeller();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    let list = products;
    if (filter === "in_stock") {
      list = list.filter((p) => p.active && p.stock > 3);
    } else if (filter === "low_stock") {
      list = list.filter((p) => p.active && p.stock > 0 && p.stock <= 3);
    } else if (filter === "out_of_stock") {
      list = list.filter((p) => p.active && p.stock <= 0);
    } else if (filter === "unlisted") {
      list = list.filter((p) => !p.active);
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.storeName && p.storeName.toLowerCase().includes(q)),
    );
  }, [products, filter, search]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      in_stock: products.filter((p) => p.active && p.stock > 3).length,
      low_stock: products.filter((p) => p.active && p.stock > 0 && p.stock <= 3).length,
      out_of_stock: products.filter((p) => p.active && p.stock <= 0).length,
      unlisted: products.filter((p) => !p.active).length,
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Page Heading & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Manage your items, update prices, inventory quantities, and listing visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateProduct}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-on-primary shadow-sm hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Product
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/40 border border-error-container p-4 text-xs text-on-error-container">
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-2xl border border-surface-container">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, or tag…"
            className="h-10 w-full rounded-xl bg-surface-container-low pl-9 pr-8 text-xs text-on-surface placeholder:text-outline outline-none ring-1 ring-inset ring-outline-variant/50 focus:ring-2 focus:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {(
            [
              { id: "all", label: "All", count: counts.all },
              { id: "in_stock", label: "In Stock", count: counts.in_stock },
              { id: "low_stock", label: "Low Stock", count: counts.low_stock },
              { id: "out_of_stock", label: "Out of Stock", count: counts.out_of_stock },
              { id: "unlisted", label: "Unlisted", count: counts.unlisted },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === t.id
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === t.id
                    ? "bg-on-primary/20 text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid / List */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const badge = getStockBadge(p);
          const isBusy = busyId === p.id;

          return (
            <div
              key={p.id}
              className={`group relative rounded-2xl bg-surface-container-lowest p-4 sm:p-5 border border-surface-container shadow-xs hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !p.active ? "opacity-75 bg-surface-container-low/30" : ""
              }`}
            >
              {/* Product Info */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-20 w-20 rounded-xl bg-surface-container object-cover flex-shrink-0 border border-surface-container-high"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant flex-shrink-0">
                    <span className="material-symbols-outlined text-[32px]">inventory_2</span>
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-sm sm:text-base font-semibold text-on-surface truncate max-w-sm">
                      {p.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}>
                      {badge.text}
                    </span>
                    {p.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-fixed text-on-primary-fixed">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface text-sm">{formatNaira(p.price)}</span>
                    {p.oldPrice && (
                      <span className="line-through text-outline text-xs">{formatNaira(p.oldPrice)}</span>
                    )}
                    <span>•</span>
                    <span className="capitalize">{p.category}</span>
                    {p.freeDelivery && (
                      <>
                        <span>•</span>
                        <span className="text-secondary font-medium flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                          Free Delivery
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-[11px] text-on-surface-variant">
                    Stock count: <strong className="text-on-surface">{p.stock} units</strong>
                    {p.storeLocation && ` • Location: ${p.storeLocation}`}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-surface-container flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEditProduct(p)}
                  className="flex h-9 items-center gap-1.5 px-3 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>

                {p.stock <= 0 ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleSetStock(p, 10)}
                    className="flex h-9 items-center gap-1.5 px-3 rounded-xl bg-secondary-container text-xs font-semibold text-on-secondary-container hover:opacity-90 transition-colors disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_box</span>
                    Restock +10
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleSetStock(p, 0)}
                    className="flex h-9 items-center gap-1 px-2.5 rounded-xl bg-surface-container text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-60"
                    title="Mark stock as 0"
                  >
                    Set Out of Stock
                  </button>
                )}

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleToggleActive(p)}
                  className="flex h-9 items-center gap-1 px-3 rounded-xl bg-surface-container text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {p.active ? "visibility_off" : "visibility"}
                  </span>
                  {p.active ? "Unlist" : "List"}
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleDeleteProduct(p)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-60"
                  title="Delete product"
                  aria-label="Delete"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="rounded-2xl bg-surface-container-lowest p-12 text-center border border-surface-container">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="font-display text-base font-semibold text-on-surface">No products found</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              {search || filter !== "all"
                ? "Try clearing filters or search query to see other catalog items."
                : "Your inventory is currently empty. Start selling by adding your first product."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {(search || filter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="h-10 px-4 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={openCreateProduct}
                className="h-10 px-4 rounded-xl bg-primary text-xs font-semibold text-on-primary hover:bg-primary/90"
              >
                Create Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
