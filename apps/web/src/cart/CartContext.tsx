import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addToCart as apiAddToCart, getCart } from "../api/buyer";
import type { CartSummary } from "../api/types";

interface CartContextValue {
  cart: CartSummary | null;
  toast: string | null;
  refresh: () => Promise<void>;
  quickAdd: (productId: string, label: string) => Promise<void>;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const refresh = useCallback(async () => {
    setCart(await getCart());
  }, []);

  const quickAdd = useCallback(
    async (productId: string, label: string) => {
      const next = await apiAddToCart(productId, 1);
      if (next.items.length > 0) setCart(next);
      else {
        // mock fallback has empty items but updated count; refresh keeps baseline
        await refresh();
      }
      showToast(`Added ${label} to cart!`);
    },
    [refresh, showToast],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ cart, toast, refresh, quickAdd, showToast }),
    [cart, toast, refresh, quickAdd, showToast],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
