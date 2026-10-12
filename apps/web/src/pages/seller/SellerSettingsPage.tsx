import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useSeller } from "./SellerContext";

export default function SellerSettingsPage() {
  const { user } = useAuth();
  const { stats, products } = useSeller();

  const storeName = products[0]?.storeName || `${user?.firstName}'s Mart`;
  const storeLocation = products[0]?.storeLocation || "Nigeria";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Store Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Manage your storefront identity, business details, and seller credentials.
        </p>
      </div>

      {/* Store Identity Card */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 border border-surface-container shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container text-2xl font-bold font-display text-on-primary shadow-xs">
            {storeName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-on-surface truncate">{storeName}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-semibold text-on-secondary-container">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Verified Merchant
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {storeLocation} • {products.length} listed products
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-container text-xs">
          <div>
            <span className="text-on-surface-variant font-medium block">Owner Account</span>
            <span className="text-sm font-semibold text-on-surface mt-0.5 block">
              {user ? `${user.firstName} ${user.lastName}` : "—"}
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium block">Contact Email</span>
            <span className="text-sm font-semibold text-on-surface mt-0.5 block">
              {user?.email ?? "—"}
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium block">Account Role</span>
            <span className="text-sm font-semibold text-primary capitalize mt-0.5 block">
              {user?.role ?? "Seller"}
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant font-medium block">Account ID</span>
            <span className="text-xs font-mono text-outline mt-0.5 block truncate">
              {user?.id ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Seller Performance Metrics */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 border border-surface-container shadow-xs">
        <h3 className="font-display text-base font-semibold text-on-surface mb-3">
          Merchant Performance Rating
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-surface-container-low p-4">
            <span className="text-on-surface-variant">Order Completion Rate</span>
            <p className="text-lg font-bold text-on-surface mt-1">98.4%</p>
            <span className="text-[11px] text-secondary">High reliability</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-4">
            <span className="text-on-surface-variant">Active Product Listings</span>
            <p className="text-lg font-bold text-on-surface mt-1">{stats?.activeProducts ?? 0}</p>
            <span className="text-[11px] text-on-surface-variant">Catalog items visible</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-4">
            <span className="text-on-surface-variant">Fulfillment Speed</span>
            <p className="text-lg font-bold text-on-surface mt-1">&lt; 24h</p>
            <span className="text-[11px] text-secondary">Fast dispatcher</span>
          </div>
        </div>
      </div>

      {/* Quick Links & Shortcuts */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 border border-surface-container shadow-xs">
        <h3 className="font-display text-base font-semibold text-on-surface mb-3">Quick Actions</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/shop"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            View Buyer Storefront
          </Link>
          <Link
            to="/account"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            User Profile & Security
          </Link>
        </div>
      </div>
    </div>
  );
}
