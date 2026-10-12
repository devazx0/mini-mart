import { Navigate } from "react-router-dom";
export { homePathForRole } from "./seller/SellerLayout";

export default function SellerDashboardPage() {
  return <Navigate to="/seller/overview" replace />;
}
