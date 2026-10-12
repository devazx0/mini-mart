import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CartProvider } from "./cart/CartContext";
import AdminPage from "./pages/AdminPage";
import AccountPage from "./pages/AccountPage";
import BuyerOverviewPage from "./pages/BuyerOverviewPage";
import CartPage from "./pages/CartPage";
import EscrowCheckoutPage from "./pages/EscrowCheckoutPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import SellerLayout, { homePathForRole } from "./pages/seller/SellerLayout";
import SellerOverviewPage from "./pages/seller/SellerOverviewPage";
import SellerProductsPage from "./pages/seller/SellerProductsPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";
import SellerFinancesPage from "./pages/seller/SellerFinancesPage";
import SellerSettingsPage from "./pages/seller/SellerSettingsPage";
import ShopPage from "./pages/ShopPage";
import SignupPage from "./pages/SignupPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-on-surface-variant">
        Loading session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ next: location.pathname }} />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-on-surface-variant">
        Loading session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ next: location.pathname }} />;
  if (!roles.includes(user.role)) return <Navigate to={homePathForRole(user.role)} replace />;
  return <>{children}</>;
}

function IndexRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-on-surface-variant">
        Loading session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "seller") return <Navigate to="/seller" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <BuyerOverviewPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<IndexRoute />} />
            <Route
              path="/seller"
              element={
                <RequireRole roles={["seller", "admin"]}>
                  <SellerLayout />
                </RequireRole>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<SellerOverviewPage />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="finances" element={<SellerFinancesPage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
            </Route>
            <Route
              path="/shop"
              element={
                <RequireAuth>
                  <ShopPage />
                </RequireAuth>
              }
            />
            <Route
              path="/cart"
              element={
                <RequireAuth>
                  <CartPage />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <EscrowCheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <OrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
