import { apiFetch } from "./client";
import type { SellerOrderItem, SellerProduct, SellerProductInput, SellerStats } from "./types";

export function listSellerProducts(): Promise<SellerProduct[]> {
  return apiFetch<SellerProduct[]>("/api/seller/products");
}

export function createSellerProduct(input: SellerProductInput): Promise<SellerProduct> {
  return apiFetch<SellerProduct>("/api/seller/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSellerProduct(
  id: string,
  input: Partial<SellerProductInput>,
): Promise<SellerProduct> {
  return apiFetch<SellerProduct>(`/api/seller/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteSellerProduct(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/seller/products/${id}`, { method: "DELETE" });
}

export function listSellerOrders(limit = 50): Promise<SellerOrderItem[]> {
  return apiFetch<SellerOrderItem[]>(`/api/seller/orders?limit=${limit}`);
}

export function updateOrderFulfillment(
  orderId: string,
  status: "processing" | "shipped" | "delivered" | "completed",
): Promise<{ orderId: string; orderNo: string; fulfillmentStatus: string }> {
  return apiFetch(`/api/seller/orders/${orderId}/fulfillment`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getSellerStats(): Promise<SellerStats> {
  return apiFetch<SellerStats>("/api/seller/stats");
}

export function formatNaira(n: number): string {
  return `₦${Number(n ?? 0).toLocaleString("en-NG")}`;
}
