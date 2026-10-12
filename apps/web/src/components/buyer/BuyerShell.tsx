import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../cart/CartContext";

function TabLink({ to, icon, label, badge }: { to: string; icon: string; label: string; badge?: number }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `relative flex w-14 h-11 flex-col items-center justify-center transition-colors ${
          isActive ? "text-primary font-medium" : "text-on-surface-variant hover:text-on-surface"
        }`
      }
    >
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
      {badge != null && badge > 0 && (
        <span className="absolute top-1 right-2.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium leading-tight text-on-primary">
          {badge}
        </span>
      )}
      <span className="mt-0.5 text-[11px] font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}

export default function BuyerShell({
  title,
  children,
  hideNav = false,
  showBack = false,
}: {
  title: string;
  children: ReactNode;
  hideNav?: boolean;
  showBack?: boolean;
}) {
  const { user, logout } = useAuth();
  const { cart, toast } = useCart();
  const [drawer, setDrawer] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="fixed inset-x-0 top-0 z-40 bg-surface-container-lowest/90 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            {showBack ? (
              <button
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
            ) : (
              <button
                aria-label="Open Menu"
                onClick={() => setDrawer(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[22px]">menu</span>
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container font-display text-lg font-bold text-on-primary">
              A
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-display text-[20px] font-semibold leading-7">{title}</span>
              <span className="truncate text-xs text-on-surface-variant">ApexMarket</span>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <div className="flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-medium capitalize">Buyer</span>
            </div>
            <button
              aria-label="Notifications"
              onClick={() => navigate("/account")}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </button>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="relative flex h-full w-[310px] max-w-[85vw] flex-col bg-surface-container-lowest pb-safe pt-safe shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="font-display text-base font-semibold">ApexMarket</span>
              <button
                aria-label="Close Drawer"
                onClick={() => setDrawer(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-4 py-2">
              <div className="rounded-xl bg-surface-container-low p-3">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-semibold text-on-primary">
                    {(user?.firstName?.[0] ?? "J").toUpperCase()}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[16px] font-semibold">
                      {user ? `${user.firstName} ${user.lastName}` : "Buyer"}
                    </span>
                    <span className="truncate text-xs text-on-surface-variant">{user?.email ?? ""}</span>
                  </div>
                </div>
                <div className="flex rounded-lg bg-surface-container-high p-0.5 text-[11px] font-medium">
                  <span className="flex-1 rounded bg-surface-container-lowest py-1 text-center text-primary shadow-sm">Buyer</span>
                  <span className="flex-1 py-1 text-center text-on-surface-variant">Seller</span>
                  <span className="flex-1 py-1 text-center text-on-surface-variant">Admin</span>
                </div>
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-2">
              <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Buyer Navigation</span>
              {[
                { to: "/", icon: "dashboard", label: "Overview" },
                { to: "/shop", icon: "storefront", label: "Shop Catalog" },
                { to: "/cart", icon: "shopping_bag", label: "Cart" },
                { to: "/orders", icon: "receipt_long", label: "My Orders" },
                { to: "/account", icon: "person", label: "Account & Escrow" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setDrawer(false)}
                  className="flex h-11 items-center gap-3 rounded-xl px-3 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">{l.icon}</span>
                  <span className="text-sm font-medium">{l.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-1 bg-surface-container-low p-4">
              <button
                onClick={() => void logout()}
                className="flex h-11 items-center gap-3 rounded-xl px-3 text-error hover:bg-error-container/40"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="relative flex w-full flex-1 flex-col pb-24 pt-16">{children}</main>

      {toast && (
        <div className="pointer-events-none fixed inset-x-4 bottom-20 z-50 transition-all">
          <div className="mx-auto flex max-w-[420px] items-center justify-center gap-2 rounded-xl bg-on-background px-4 py-2 text-on-primary shadow-xl">
            <span className="material-symbols-outlined text-[18px] text-secondary-fixed">shopping_cart_checkout</span>
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}

      {!hideNav && (
        <nav className="fixed inset-x-0 bottom-0 z-40 bg-surface-container-lowest/90 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mx-auto flex h-[60px] max-w-[420px] items-center justify-around px-1">
            <TabLink to="/" icon="dashboard" label="Overview" />
            <TabLink to="/shop" icon="storefront" label="Shop" />
            <TabLink to="/cart" icon="shopping_bag" label="Cart" badge={cart?.count ?? 3} />
            <TabLink to="/orders" icon="receipt_long" label="Orders" />
            <TabLink to="/account" icon="person" label="Account" />
          </div>
        </nav>
      )}
    </div>
  );
}
