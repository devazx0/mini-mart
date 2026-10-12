import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AuthLayout } from "../components/ui";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow="Marketplace">
      <h1 className="font-display text-xl font-semibold tracking-tight">
        {user ? `Welcome, ${user.firstName}` : "Welcome to ApexMarket"}
      </h1>
      {user ? (
        <div className="mt-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-on-surface-variant">Name</dt>
              <dd className="font-medium">
                {user.firstName} {user.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-on-surface-variant">Role</dt>
              <dd className="font-medium capitalize">{user.role}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wider text-on-surface-variant">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onLogout}
            disabled={busy}
            className="mt-4 h-10 w-full rounded-lg bg-surface-container text-sm font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-60"
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Link
            to="/signup"
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-medium text-on-primary"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="flex h-11 flex-1 items-center justify-center rounded-xl bg-surface-container text-sm font-medium text-on-surface"
          >
            Sign in
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
