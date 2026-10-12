import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatNaira, getBuyerStats, getNotifications, getRecentOrders, getTracking, listProducts } from "../api/buyer";
import type { BuyerStats, OrderView, Product, TrackingMilestone } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import BuyerShell from "../components/buyer/BuyerShell";

function useGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function BuyerOverviewPage() {
  const { user } = useAuth();
  const { quickAdd } = useCart();
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [tracker, setTracker] = useState<{ order: OrderView; milestones: TrackingMilestone[] } | null>(null);
  const [role, setRole] = useState<"buyer" | "seller" | "admin">("buyer");

  useEffect(() => {
    void getBuyerStats().then(setStats);
    void getRecentOrders(2).then(setOrders);
    void listProducts({}).then((r) => setRecommended(r.items.slice(0, 4)));
    void getNotifications().then((n) => {
      if (n[0] && !n[0].read) setNotice(n[0].body);
    });
  }, []);

  async function openTracker(order: OrderView) {
    const milestones = await getTracking(order.id);
    setTracker({ order, milestones });
  }

  const firstName = user?.firstName ?? "John";

  return (
    <BuyerShell title="Overview">
      <div className="w-full bg-gradient-to-b from-surface-container-high/60 via-surface to-surface px-4 pb-5 pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="inline-flex rounded-full bg-surface-container-high p-1 shadow-sm">
            {(["buyer", "seller", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`h-8 rounded-full px-4 text-[11px] font-medium capitalize transition-all ${
                  role === r ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-1 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            <span className="text-xs text-on-surface-variant">Escrow Protected</span>
          </div>
        </div>

        <h1 className="font-display text-[20px] font-semibold">
          {useGreeting()}, {firstName} <span>👋</span>
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">Here&apos;s what&apos;s happening with your shopping activity.</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: "Total Orders", value: String(stats?.totalOrders ?? 14), icon: "shopping_bag", sub: `+${stats?.deltaMonth ?? 2} this month` },
            { label: "Pending", value: String(stats?.pending ?? 2), icon: "local_shipping", sub: "Active fulfillment" },
            { label: "Completed", value: String(stats?.completed ?? 12), icon: "done_all", sub: "100% verified" },
            { label: "Total Spent", value: formatNaira(stats?.totalSpent ?? 348500), icon: "account_balance_wallet", sub: "Statements" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">{s.label}</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-display text-[24px] font-semibold tracking-tight">{s.value}</span>
                <div className="mt-0.5 text-[11px] font-medium text-secondary">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold">
              Active & Recent Orders
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-medium">2 active</span>
            </h2>
            <Link to="/orders" className="flex items-center gap-0.5 text-sm font-medium text-primary">
              View all (14) <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src={o.items[0]?.imageUrl} alt="" className="h-14 w-14 flex-shrink-0 rounded-lg bg-surface-container object-cover" />
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-medium text-primary">#{o.orderNo}</span>
                        <span className="h-1 w-1 rounded-full bg-outline-variant" />
                        <span className="truncate text-on-surface-variant">
                          {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="mt-0.5 truncate text-sm font-medium">{o.itemName}</h3>
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px]">store</span> {o.merchantName}
                      </span>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[16px] font-semibold">{formatNaira(o.total)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5 text-[11px] font-medium text-on-secondary-fixed-variant">
                      Paid
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-medium text-on-tertiary-fixed-variant">
                      {o.fulfillmentStatus === "shipped" ? "Shipped" : "Processing"}
                    </span>
                  </div>
                  <button
                    onClick={() => void openTracker(o)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-surface-container-low px-4 text-sm font-medium text-primary hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[18px]">navigation</span> Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold">
              Recommended For You
              <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
            </h2>
            <span className="text-xs text-on-surface-variant">Personalized</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {recommended.map((p) => (
              <div key={p.id} className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
                <div className="relative aspect-square w-full bg-surface-container">
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  <button aria-label="Add to wishlist" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                </div>
                <div className="flex flex-1 flex-col justify-between gap-1 p-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
                      <span className="truncate">{p.seller.storeName}</span>
                      <span className="font-bold text-on-surface">★ {p.rating.toFixed(1)}</span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-medium">{p.name}</h3>
                  </div>
                  <div className="mt-1 flex flex-col gap-2">
                    <span className="text-[16px] font-semibold">{formatNaira(p.price)}</span>
                    <button
                      onClick={() => void quickAdd(p.id, `${p.name} (${formatNaira(p.price)})`)}
                      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-medium text-on-primary"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {notice && (
        <div className="fixed inset-x-4 top-20 z-50">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-inverse-surface p-2 text-inverse-on-surface shadow-lg">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary-fixed text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[11px] font-medium text-inverse-primary">Order Update</span>
                <span className="truncate text-[13px]">{notice}</span>
              </div>
            </div>
            <button aria-label="Dismiss notification" onClick={() => setNotice(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-variant/20">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {tracker && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setTracker(null)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[751px] flex-col gap-3 overflow-y-auto rounded-t-2xl bg-surface-container-lowest p-6 shadow-2xl">
            <div className="mx-auto h-1 w-12 rounded-full bg-outline-variant" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-primary">Shipment Milestone</span>
                <h3 className="font-display text-[20px] font-semibold">{tracker.order.orderNo}</h3>
              </div>
              <button onClick={() => setTracker(null)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-2">
              <span className="material-symbols-outlined text-[24px] text-secondary">verified</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{tracker.order.itemName}</span>
                <span className="text-xs text-on-surface-variant">{tracker.order.merchantName}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 py-1">
              {tracker.milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${m.done ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                    </div>
                    {i < tracker.milestones.length - 1 && <div className="h-10 w-0.5 bg-surface-container-high" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.title}</span>
                    <span className="text-xs text-on-surface-variant">{m.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setTracker(null)} className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-on-primary">
              Done
            </button>
          </div>
        </div>
      )}
    </BuyerShell>
  );
}
