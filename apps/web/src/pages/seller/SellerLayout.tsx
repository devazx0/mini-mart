import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import ProductModal from "./components/ProductModal";
import { SellerProvider, useSeller } from "./SellerContext";

export function homePathForRole(role: string | undefined): string {
  if (role === "seller") return "/seller/overview";
  if (role === "admin") return "/admin";
  return "/";
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: (stats: ReturnType<typeof useSeller>["stats"]) => number | undefined;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/seller/overview",
    label: "Overview",
    icon: "dashboard",
  },
  {
    to: "/seller/products",
    label: "Products",
    icon: "inventory_2",
    badge: (stats) => (stats?.lowStock || 0) + (stats?.outOfStock || 0) || undefined,
    badgeColor: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  {
    to: "/seller/orders",
    label: "Orders",
    icon: "receipt_long",
    badge: (stats) => stats?.pendingFulfillment || undefined,
    badgeColor: "bg-error-container text-on-error-container",
  },
  {
    to: "/seller/finances",
    label: "Finances",
    icon: "account_balance_wallet",
  },
  {
    to: "/seller/settings",
    label: "Store Settings",
    icon: "settings",
  },
];

function SellerLayoutInner() {
  const { user, logout } = useAuth();
  const {
    stats,
    modalOpen,
    editingProduct,
    closeProductModal,
    handleSaveProduct,
    openCreateProduct,
  } = useSeller();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  async function onLogout() {
    setSigningOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setSigningOut(false);
    }
  }

  // Get current section name for header
  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const pageTitle = currentNav?.label ?? "Seller Dashboard";

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      {/* Desktop Sidebar (hidden on small screens) */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-30 bg-surface-container-lowest border-r border-surface-container">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-surface-container">
          <Link to="/seller/overview" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container font-display text-lg font-bold text-on-primary shadow-xs">
              A
            </div>
            <div className="leading-tight">
              <span className="font-display text-base font-bold tracking-tight text-on-surface">
                ApexMarket
              </span>
              <span className="block text-[11px] font-semibold text-primary">Seller Portal</span>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/60 px-2 py-0.5 text-[10px] font-semibold text-on-secondary-container">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Live
          </span>
        </div>

        {/* Store Profile Snapshot */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-surface-container-low/80 border border-surface-container">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
              {user?.firstName?.slice(0, 1) || "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-on-surface">
                {user ? `${user.firstName} ${user.lastName}` : "Merchant"}
              </p>
              <p className="truncate text-[11px] text-on-surface-variant">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-outline">
            Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const badgeValue = item.badge?.(stats);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-[20px] transition-colors ${
                          isActive ? "text-on-primary" : "text-outline group-hover:text-on-surface"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {badgeValue != null && badgeValue > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-on-primary/20 text-on-primary"
                            : item.badgeColor || "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {badgeValue}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Actions & Footer */}
        <div className="p-3 border-t border-surface-container space-y-2">
          <Link
            to="/shop"
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">storefront</span>
            <span>View Storefront</span>
          </Link>

          <button
            type="button"
            disabled={signingOut}
            onClick={() => void onLogout()}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/30 transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>{signingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-surface-container-lowest shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-surface-container">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-container font-display text-base font-bold text-on-primary">
                  A
                </div>
                <span className="font-display text-base font-bold text-on-surface">ApexMarket</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                aria-label="Close drawer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const badgeValue = item.badge?.(stats);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-primary text-on-primary shadow-xs"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {badgeValue != null && badgeValue > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-on-primary/20 text-on-primary"
                                : item.badgeColor || "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {badgeValue}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-surface-container space-y-2">
              <Link
                to="/shop"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span>View Storefront</span>
              </Link>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/30"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Open sidebar navigation"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span>Seller</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="font-semibold text-on-surface">{pageTitle}</span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openCreateProduct}
              className="hidden sm:flex h-9 items-center gap-1.5 px-3.5 rounded-xl bg-primary text-xs font-semibold text-on-primary shadow-xs hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Product</span>
            </button>

            <Link
              to="/shop"
              className="hidden lg:flex h-9 items-center gap-1.5 px-3 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span>Shop</span>
            </Link>

            <div className="h-4 w-px bg-surface-container hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Merchant
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Product Form Modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={closeProductModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

export default function SellerLayout() {
  return (
    <SellerProvider>
      <SellerLayoutInner />
    </SellerProvider>
  );
}
