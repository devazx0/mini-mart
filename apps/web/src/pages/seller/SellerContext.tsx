import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError } from "../../api/client";
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerStats,
  listSellerOrders,
  listSellerProducts,
  updateOrderFulfillment,
  updateSellerProduct,
} from "../../api/seller";
import type { SellerOrderItem, SellerProduct, SellerProductInput, SellerStats } from "../../api/types";

interface SellerContextType {
  products: SellerProduct[];
  orders: SellerOrderItem[];
  stats: SellerStats | null;
  loading: boolean;
  error: string | null;
  busyId: string | null;
  modalOpen: boolean;
  editingProduct: SellerProduct | null;
  refresh: () => Promise<void>;
  openCreateProduct: () => void;
  openEditProduct: (p: SellerProduct) => void;
  closeProductModal: () => void;
  handleSaveProduct: (input: SellerProductInput) => Promise<SellerProduct>;
  handleToggleActive: (p: SellerProduct) => Promise<void>;
  handleSetStock: (p: SellerProduct, stock: number) => Promise<void>;
  handleDeleteProduct: (p: SellerProduct) => Promise<void>;
  handleFulfillment: (orderId: string, status: SellerOrderItem["fulfillmentStatus"]) => Promise<void>;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrderItem[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [p, o, s] = await Promise.all([
        listSellerProducts(),
        listSellerOrders(100),
        getSellerStats(),
      ]);
      setProducts(p);
      setOrders(o);
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load seller dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openCreateProduct() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditProduct(p: SellerProduct) {
    setEditingProduct(p);
    setModalOpen(true);
  }

  function closeProductModal() {
    setModalOpen(false);
    setEditingProduct(null);
  }

  async function handleSaveProduct(input: SellerProductInput): Promise<SellerProduct> {
    if (editingProduct) {
      const saved = await updateSellerProduct(editingProduct.id, input);
      setProducts((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
      void getSellerStats().then(setStats);
      closeProductModal();
      return saved;
    } else {
      const saved = await createSellerProduct(input);
      setProducts((prev) => [saved, ...prev]);
      void getSellerStats().then(setStats);
      closeProductModal();
      return saved;
    }
  }

  async function handleToggleActive(p: SellerProduct) {
    setBusyId(p.id);
    try {
      const next = await updateSellerProduct(p.id, { active: !p.active });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? next : x)));
      const s = await getSellerStats();
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update product");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetStock(p: SellerProduct, stock: number) {
    setBusyId(p.id);
    try {
      const next = await updateSellerProduct(p.id, { stock });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? next : x)));
      const s = await getSellerStats();
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update stock");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteProduct(p: SellerProduct) {
    if (!window.confirm(`Unlist "${p.name}"? It will be hidden from the storefront but kept for order records.`)) {
      return;
    }
    setBusyId(p.id);
    try {
      await deleteSellerProduct(p.id);
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: false } : x)));
      const s = await getSellerStats();
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete product");
    } finally {
      setBusyId(null);
    }
  }

  async function handleFulfillment(orderId: string, status: SellerOrderItem["fulfillmentStatus"]) {
    setBusyId(orderId);
    try {
      await updateOrderFulfillment(
        orderId,
        status as "processing" | "shipped" | "delivered" | "completed",
      );
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, fulfillmentStatus: status } : o)),
      );
      const s = await getSellerStats();
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update order fulfillment");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SellerContext.Provider
      value={{
        products,
        orders,
        stats,
        loading,
        error,
        busyId,
        modalOpen,
        editingProduct,
        refresh,
        openCreateProduct,
        openEditProduct,
        closeProductModal,
        handleSaveProduct,
        handleToggleActive,
        handleSetStock,
        handleDeleteProduct,
        handleFulfillment,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return ctx;
}
