import { Link } from "react-router-dom";
import { formatNaira } from "../../api/seller";
import { useAuth } from "../../auth/AuthContext";
import { useSeller } from "./SellerContext";

export default function SellerOverviewPage() {
  const { user } = useAuth();
  const {
    stats,
    products,
    orders,
    loading,
    error,
    busyId,
    openCreateProduct,
    handleSetStock,
  } = useSeller();

  const lowStockItems = products.filter((p) => p.active && p.stock > 0 && p.stock <= 3);
  const outOfStockItems = products.filter((p) => p.active && p.stock <= 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container to-surface-container-high/40 p-6 md:p-8 border border-primary/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[15px]">storefront</span>
              Seller Hub
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              Welcome back, {user?.firstName ?? "Seller"}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant max-w-xl">
              Track store performance, fulfill buyer orders, manage stock levels, and monitor escrow payouts in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openCreateProduct}
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-on-primary shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Product
            </button>
            <Link
              to="/shop"
              className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-lowest px-4 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Storefront Preview
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/40 border border-error-container p-4 text-xs text-on-error-container flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="group rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(stats?.totalRevenue ?? 0)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[15px] text-secondary">trending_up</span>
            <span>All-time gross sales</span>
          </div>
        </div>

        {/* Pending Escrow */}
        <div className="group rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs hover:border-tertiary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              In Escrow
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(stats?.pendingRevenue ?? 0)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[15px] text-on-surface-variant">verified_user</span>
            <span>Releases on order delivery</span>
          </div>
        </div>

        {/* Settled Revenue */}
        <div className="group rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs hover:border-secondary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Settled Funds
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(stats?.settledRevenue ?? 0)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary font-medium">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span>Ready for payout</span>
          </div>
        </div>

        {/* Orders awaiting fulfillment */}
        <div className="group rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Fulfillment
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : stats?.pendingFulfillment ?? 0}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span>Awaiting fulfillment ({stats?.totalOrders ?? 0} total)</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Inventory Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-container-lowest p-6 border border-surface-container shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <div>
              <h2 className="font-display text-base font-semibold text-on-surface">Recent Orders</h2>
              <p className="text-xs text-on-surface-variant">Latest purchases containing your items</p>
            </div>
            <Link
              to="/seller/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Orders
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="mt-4 divide-y divide-surface-container">
            {recentOrders.map((o) => (
              <div key={o.itemId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {o.imageUrl ? (
                    <img
                      src={o.imageUrl}
                      alt={o.productName}
                      className="h-12 w-12 rounded-xl bg-surface-container object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">{o.productName}</p>
                    <p className="text-xs text-on-surface-variant">
                      Order #{o.orderNo} • Qty: {o.qty} • {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-on-surface">{formatNaira(o.lineTotal)}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-surface-container text-on-surface-variant">
                      {o.fulfillmentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {recentOrders.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant mb-2">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <p className="text-sm font-medium text-on-surface">No orders yet</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Orders will appear here once buyers check out.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Inventory Health & Stock Warnings */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-surface-container shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <div>
              <h2 className="font-display text-base font-semibold text-on-surface">Stock Health</h2>
              <p className="text-xs text-on-surface-variant">Attention required items</p>
            </div>
            <Link
              to="/seller/products"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Catalog
            </Link>
          </div>

          <div className="mt-4 space-y-3 flex-1">
            {/* Quick overview counters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-tertiary-fixed/30 p-3 border border-tertiary-fixed">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-tertiary-fixed-variant">Low Stock</p>
                <p className="text-lg font-bold text-on-surface mt-0.5">{stats?.lowStock ?? 0}</p>
                <p className="text-[10px] text-on-surface-variant">≤ 3 items left</p>
              </div>
              <div className="rounded-xl bg-error-container/30 p-3 border border-error-container">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-error-container">Out of Stock</p>
                <p className="text-lg font-bold text-on-surface mt-0.5">{stats?.outOfStock ?? 0}</p>
                <p className="text-[10px] text-on-surface-variant">Needs restock</p>
              </div>
            </div>

            {/* List of items that need attention */}
            <div className="mt-3 space-y-2">
              {[...outOfStockItems, ...lowStockItems].slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">{item.name}</p>
                    <span
                      className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        item.stock <= 0
                          ? "bg-error-container text-on-error-container"
                          : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                      }`}
                    >
                      {item.stock <= 0 ? "0 remaining" : `${item.stock} left`}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void handleSetStock(item, (item.stock || 0) + 10)}
                    className="flex-shrink-0 h-7 px-2.5 rounded-lg bg-surface-container text-[11px] font-semibold text-primary hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60"
                  >
                    +10 Stock
                  </button>
                </div>
              ))}

              {outOfStockItems.length === 0 && lowStockItems.length === 0 && (
                <div className="py-8 text-center">
                  <span className="material-symbols-outlined text-[28px] text-secondary">check_circle</span>
                  <p className="text-xs font-semibold text-on-surface mt-1">Inventory healthy</p>
                  <p className="text-[11px] text-on-surface-variant">All active products have sufficient stock.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container mt-4">
            <button
              type="button"
              onClick={openCreateProduct}
              className="w-full flex h-10 items-center justify-center gap-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Another Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
