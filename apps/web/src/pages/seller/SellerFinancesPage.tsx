import { formatNaira } from "../../api/seller";
import { useSeller } from "./SellerContext";

export default function SellerFinancesPage() {
  const { stats, orders, loading, error } = useSeller();

  const avgOrderValue =
    stats && stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Finances & Settlements
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Monitor your earnings, escrow releases, transaction ledger, and payout schedule.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container/40 border border-error-container p-4 text-xs text-on-error-container">
          {error}
        </div>
      )}

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Total Earnings
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(stats?.totalRevenue ?? 0)}
          </p>
          <p className="mt-1.5 text-xs text-on-surface-variant">Gross volume across all sales</p>
        </div>

        {/* Settled Funds */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Settled Balance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(stats?.settledRevenue ?? 0)}
          </p>
          <p className="mt-1.5 text-xs text-secondary font-medium">Released & ready for bank transfer</p>
        </div>

        {/* Escrow Pool */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Held in Escrow
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-[20px]">lock_clock</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(stats?.pendingRevenue ?? 0)}
          </p>
          <p className="mt-1.5 text-xs text-on-surface-variant">Awaiting delivery confirmation</p>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Avg. Order Value
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-on-surface">
            {loading ? "…" : formatNaira(avgOrderValue)}
          </p>
          <p className="mt-1.5 text-xs text-on-surface-variant">{stats?.totalOrders ?? 0} total orders</p>
        </div>
      </div>

      {/* Escrow Mechanism Info Card */}
      <div className="rounded-2xl bg-surface-container-low/60 p-5 border border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-on-primary flex-shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">shield</span>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-on-surface">
              ApexMarket Escrow Protection Guarantee
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Buyer payments are secured in escrow upon order placement. Once you ship the order and the buyer confirms receipt, funds are automatically released to your settled balance.
            </p>
          </div>
        </div>
      </div>

      {/* Settlement Transactions Ledger */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 border border-surface-container shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div>
            <h2 className="font-display text-base font-semibold text-on-surface">Settlement Ledger</h2>
            <p className="text-xs text-on-surface-variant">Detailed record of item payouts and escrow status</p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-surface-container">
          {orders.map((o) => (
            <div key={o.itemId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-primary font-mono text-xs font-bold flex-shrink-0">
                  #
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    Order #{o.orderNo} — {o.productName}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(o.createdAt).toLocaleDateString()} • Qty: {o.qty} • Method: {o.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">{formatNaira(o.lineTotal)}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      o.escrowStatus === "released"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                    }`}
                  >
                    {o.escrowStatus === "released" ? "Settled" : "In Escrow"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && !loading && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2">
                receipt_long
              </span>
              <p className="text-sm font-semibold text-on-surface">No settlement records yet</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Settlements appear automatically when buyers place orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
