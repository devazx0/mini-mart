import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatNaira, listProducts } from "../api/buyer";
import type { Product } from "../api/types";
import { useCart } from "../cart/CartContext";
import BuyerShell from "../components/buyer/BuyerShell";

const CATS = [
  { slug: "all", label: "All (4,200+)", icon: "grid_view" },
  { slug: "electronics", label: "Electronics", icon: "bolt" },
  { slug: "computing", label: "Computing", icon: "laptop_mac" },
  { slug: "audio", label: "Audio", icon: "headphones" },
  { slug: "accessories", label: "Accessories", icon: "cable" },
  { slug: "fashion", label: "Fashion", icon: "apparel" },
  { slug: "home-office", label: "Home Office", icon: "desk" },
];

export default function ShopPage() {
  const { cart, quickAdd } = useCart();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("featured");
  const [items, setItems] = useState<Product[]>([]);
  const [chips, setChips] = useState<string[]>(["Under ₦50,000", "In Stock", "TechHub NG"]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [wished, setWished] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = window.setTimeout(() => {
      void listProducts({ search, category: cat, sort }).then((r) => setItems(r.items));
    }, 250);
    return () => window.clearTimeout(t);
  }, [search, cat, sort]);

  function toggleWish(id: string) {
    setWished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <BuyerShell title="Shop">
      <section className="flex flex-col gap-3 px-4 pb-2 pt-3">
        <div className="relative flex w-full items-center">
          <div className="pointer-events-none absolute left-3 flex items-center text-outline">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 4,200+ products, brands, or sellers..."
            className="h-11 w-full rounded-xl bg-surface-container-low pl-11 pr-20 text-sm text-on-surface shadow-sm outline-none placeholder:text-outline focus:bg-surface-container-lowest"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {search && (
              <button aria-label="Clear Search" onClick={() => setSearch("")} className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <span className="material-symbols-outlined text-[20px] text-outline">mic</span>
          </div>
        </div>
        <div className="relative -mx-4 px-4">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-0.5">
            {CATS.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={`flex h-8 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[11px] font-medium transition-all active:scale-95 ${
                  cat === c.slug ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-2 flex flex-col gap-2 bg-surface-container-lowest px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => setFilterOpen(true)} className="flex h-9 items-center gap-1.5 rounded-xl bg-surface-container px-4 text-sm font-medium shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span> Filters
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">3</span>
          </button>
          <div className="relative flex items-center">
            <div className="flex h-9 items-center gap-1 rounded-xl bg-surface-container-low px-2 text-sm font-medium text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-outline">swap_vert</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="cursor-pointer appearance-none bg-transparent pr-4 text-on-surface outline-none">
                <option value="featured">Featured & Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newly Listed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pt-0.5">
          <span className="mr-1 flex-shrink-0 whitespace-nowrap text-xs text-outline">Active:</span>
          {chips.map((c) => (
            <div key={c} className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-surface-container px-2 py-1 text-[11px] font-medium">
              <span>{c}</span>
              <button onClick={() => setChips((p) => p.filter((x) => x !== c))} className="flex items-center text-outline hover:text-error">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
          {chips.length > 0 && (
            <button onClick={() => setChips([])} className="flex-shrink-0 whitespace-nowrap px-1 text-[11px] font-medium text-primary hover:underline">
              Clear all
            </button>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 px-4 pb-24">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] font-semibold">Verified Listings</span>
            <span className="text-xs text-outline">(128 items found)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-secondary">
            <span className="material-symbols-outlined text-[14px]">shield_with_heart</span> Escrow Secured
          </div>
        </div>

        {items.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="relative h-48 w-full overflow-hidden bg-surface-container">
              <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
              {p.badge && (
                <div className="absolute left-2 top-2 rounded-md bg-error px-2 py-0.5 text-[11px] font-medium text-on-error shadow-sm">
                  {p.badge}
                </div>
              )}
              <button
                aria-label="Save to Wishlist"
                onClick={() => toggleWish(p.id)}
                className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/90 shadow-sm backdrop-blur-md transition-colors ${
                  wished.has(p.id) ? "text-error" : "text-outline hover:text-error"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: wished.has(p.id) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
              <div className="absolute bottom-1 left-2 flex items-center gap-1 rounded-full bg-inverse-surface/80 px-2 py-0.5 text-[10px] font-medium text-inverse-on-surface backdrop-blur-sm">
                <span className="material-symbols-outlined text-[11px] text-secondary-fixed">lock_clock</span> Apex Escrow Guaranteed
              </div>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-1.5 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                  <span className="truncate font-medium text-on-surface-variant">{p.seller.storeName}</span>
                  <span className="h-1 w-1 rounded-full bg-outline-variant" />
                  <span className="text-outline">{p.seller.location}</span>
                </div>
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    p.stock <= 3 ? "bg-tertiary-fixed text-on-tertiary-fixed-variant animate-pulse" : "bg-secondary-container text-on-secondary-container"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${p.stock <= 3 ? "bg-tertiary" : "bg-secondary"}`} />
                  {p.stock <= 3 ? `Low Stock (${p.stock} left)` : `In Stock (${p.stock} units)`}
                </div>
              </div>
              <h3 className="text-[16px] font-semibold leading-tight">{p.name}</h3>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold">★ {p.rating.toFixed(1)}</span>
                <span className="text-outline">({p.reviewCount} verified reviews)</span>
                {p.freeDelivery && <span className="ml-auto text-secondary">Free Delivery</span>}
              </div>
              <div className="mt-1 flex items-center justify-between rounded-xl bg-surface-container-low p-2">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[20px] font-bold">{formatNaira(p.price)}</span>
                    {p.oldPrice && <span className="text-xs text-outline line-through">{formatNaira(p.oldPrice)}</span>}
                  </div>
                  <span className="text-[10px] text-on-surface-variant">Instant settlement protection</span>
                </div>
                <button
                  onClick={() => void quickAdd(p.id, `${p.name} (${formatNaira(p.price)})`)}
                  className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-on-primary shadow-sm transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span> Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}

        <div className="flex items-center gap-3 rounded-xl bg-surface-container-high p-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold">100% Buyer Protection</span>
            <span className="text-xs text-on-surface-variant">Payment held in Apex Escrow until you inspect and accept items.</span>
          </div>
        </div>
      </div>

      <aside className="pointer-events-none fixed inset-x-0 bottom-[74px] z-30 px-4">
        <div className="pointer-events-auto mx-auto flex max-w-[420px] items-center justify-between gap-2 rounded-2xl bg-inverse-surface/95 p-2 pl-3 text-inverse-on-surface shadow-2xl backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-secondary-fixed px-1.5 text-[10px] font-bold text-on-secondary-fixed">
                {cart?.count ?? 3}
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[11px] font-semibold">{cart?.count ?? 3} items in cart</span>
              <span className="text-[16px] font-bold">{formatNaira(cart?.total ?? 111500)}</span>
            </div>
          </div>
          <Link to="/cart" className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-md">
            Checkout <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </aside>

      {filterOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[751px] max-w-[440px] flex-col overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-2xl">
            <div className="flex flex-col items-center px-4 pb-2 pt-3">
              <div className="mb-2 h-1.5 w-12 rounded-full bg-outline-variant" />
              <div className="flex w-full items-center justify-between">
                <span className="text-[16px] font-semibold">Filter Products</span>
                <button onClick={() => setFilterOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
              <div className="rounded-xl bg-surface-container-low p-3">
                <span className="text-sm font-semibold">Verified Sellers Only</span>
                <p className="text-xs text-outline">Escrow-backed merchant accounts</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-on-primary">In Stock Only</button>
                <button className="rounded-xl bg-surface-container-low px-3 py-2 text-sm font-medium">Include Pre-order</button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-lowest p-4">
              <button onClick={() => setFilterOpen(false)} className="h-11 flex-1 rounded-xl bg-surface-container-low text-sm font-semibold">Reset</button>
              <button onClick={() => setFilterOpen(false)} className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-on-primary shadow-md">Apply Filters (128)</button>
            </div>
          </div>
        </div>
      )}
    </BuyerShell>
  );
}
