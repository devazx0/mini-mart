import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatNaira, getCart } from "../api/buyer";
import type { CartSummary } from "../api/types";
import BuyerShell from "../components/buyer/BuyerShell";

export default function CartPage() {
  const [cart, setCart] = useState<CartSummary | null>(null);

  useEffect(() => {
    void getCart().then(setCart);
  }, []);

  return (
    <BuyerShell title="Cart">
      <div className="flex flex-col gap-3 px-4 pt-3">
        <h1 className="font-display text-[20px] font-semibold">Your Cart ({cart?.count ?? 2})</h1>
        {(cart?.items ?? []).map((ci) => (
          <div key={ci.productId} className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-lowest p-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-2">
              <img src={ci.product.imageUrl} alt="" className="h-12 w-12 rounded-lg bg-surface-container object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{ci.product.name}</p>
                <p className="text-xs text-on-surface-variant">Qty: {ci.qty} • {ci.product.seller.storeName}</p>
              </div>
            </div>
            <span className="flex-shrink-0 text-sm font-semibold">{formatNaira(ci.product.price * ci.qty)}</span>
          </div>
        ))}
        <div className="space-y-2 rounded-lg bg-surface-container-low p-3 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal</span>
            <span className="font-medium text-on-surface">{formatNaira(cart?.subtotal ?? 73000)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Standard Logistics (Lekki Phase 1)</span>
            <span className="font-medium text-on-surface">{formatNaira(cart?.shippingFee ?? 2500)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-[16px] font-semibold">
            <span>Total Amount</span>
            <span className="font-bold text-primary">{formatNaira(cart?.total ?? 75500)}</span>
          </div>
        </div>
        <Link
          to="/checkout"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-on-primary shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">lock</span> Proceed to Escrow Checkout
        </Link>
        <Link
          to="/shop"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container text-sm font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </BuyerShell>
  );
}
