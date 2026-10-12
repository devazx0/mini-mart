import { useMemo, useState } from "react";
import { formatNaira } from "../../api/seller";
import type { SellerOrderItem } from "../../api/types";
import { useSeller } from "./SellerContext";

type FulfillmentFilter = "all" | "processing" | "shipped" | "delivered" | "completed";

function getEscrowBadge(status: string): { label: string; cls: string } {
  switch (status.toLowerCase()) {
    case "released":
      return { label: "Escrow Released", cls: "bg-secondary-container text-on-secondary-container" };
    case "held":
      return { label: "Held in Escrow", cls: "bg-tertiary-fixed text-on-tertiary-fixed-variant" };
    case "refunded":
      return { label: "Refunded", cls: "bg-error-container text-on-error-container" };
    default:
      return { label: `Escrow: ${status}`, cls: "bg-surface-container text-on-surface-variant" };
  }
}

export default function SellerOrdersPage() {
  const { orders, loading, error, busyId, handleFulfillment } = useSeller();
  const [filter, setFilter] = useState<FulfillmentFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") {
      list = list.filter((o) => o.fulfillmentStatus?.toLowerCase() === filter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) =>
        o.orderNo.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.paymentMethod.toLowerCase().includes(q),
    );
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      processing: orders.filter((o) => o.fulfillmentStatus?.toLowerCase() === "processing").length,
      shipped: orders.filter((o) => o.fulfillmentStatus?.toLowerCase() === "shipped").length,
      delivered: orders.filter((o) => o.fulfillmentStatus?.toLowerCase() === "delivered").length,
      completed: orders.filter((o) => o.fulfillmentStatus?.toLowerCase() === "completed").length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Fulfill incoming buyer purchases, update tracking states, and release escrow funds.
          </p>
        </div>

        {counts.processing > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-tertiary-fixed/40 px-3.5 py-2 border border-tertiary-fixed text-xs font-semibold text-on-tertiary-fixed-variant self-start sm:self-auto">
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            <span>{counts.processing} orders awaiting shipment</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/40 border border-error-container p-4 text-xs text-on-error-container">
          {error}
        </div>
      )}

      {/* Filter Bar */}
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
            placeholder="Search by Order # or item name…"
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
              { id: "all", label: "All Orders", count: counts.all },
              { id: "processing", label: "Processing", count: counts.processing },
              { id: "shipped", label: "Shipped", count: counts.shipped },
              { id: "delivered", label: "Delivered", count: counts.delivered },
              { id: "completed", label: "Completed", count: counts.completed },
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

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.map((o) => {
          const escrow = getEscrowBadge(o.escrowStatus);
          const isBusy = busyId === o.orderId;

          return (
            <div
              key={o.itemId}
              className="rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs space-y-4 hover:border-primary/20 transition-all"
            >
              {/* Top metadata line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">
                    #{o.orderNo}
                  </span>
                  <span className="text-on-surface-variant">
                    {new Date(o.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${escrow.cls}`}>
                    {escrow.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container text-on-surface-variant capitalize">
                    {o.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Main Content Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {o.imageUrl ? (
                    <img
                      src={o.imageUrl}
                      alt={o.productName}
                      className="h-16 w-16 rounded-xl bg-surface-container object-cover flex-shrink-0 border border-surface-container-high"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant flex-shrink-0">
                      <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <h3 className="font-display text-sm sm:text-base font-semibold text-on-surface truncate max-w-md">
                      {o.productName}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Unit price: {formatNaira(o.unitPrice)} • Quantity:{" "}
                      <strong className="text-on-surface">{o.qty}</strong>
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      Item ID: <span className="font-mono">{o.itemId.slice(0, 8)}…</span>
                    </p>
                  </div>
                </div>

                {/* Right total & fulfillment controls */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-container flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-on-surface-variant block uppercase font-medium">Total</span>
                    <span className="font-display text-lg font-bold text-on-surface">
                      {formatNaira(o.lineTotal)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${o.orderId}`} className="text-xs text-on-surface-variant font-medium">
                      Status:
                    </label>
                    <select
                      id={`status-${o.orderId}`}
                      value={o.fulfillmentStatus}
                      disabled={isBusy}
                      onChange={(e) =>
                        void handleFulfillment(
                          o.orderId,
                          e.target.value as SellerOrderItem["fulfillmentStatus"],
                        )
                      }
                      className="h-9 rounded-xl bg-surface-container-low px-3 text-xs font-semibold text-on-surface outline-none ring-1 ring-inset ring-outline-variant/60 focus:ring-2 focus:ring-primary disabled:opacity-60 cursor-pointer"
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && !loading && (
          <div className="rounded-2xl bg-surface-container-lowest p-12 text-center border border-surface-container">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-[28px]">receipt_long</span>
            </div>
            <h3 className="font-display text-base font-semibold text-on-surface">No orders found</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              {search || filter !== "all"
                ? "Try clearing search or changing the fulfillment status filter."
                : "Your customer orders will appear here once buyers check out."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
