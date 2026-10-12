import { useEffect, useState } from "react";
import { formatNaira, getOrders } from "../api/buyer";
import type { OrderView } from "../api/types";
import BuyerShell from "../components/buyer/BuyerShell";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderView[]>([]);

  useEffect(() => {
    void getOrders().then(setOrders);
  }, []);

  return (
    <BuyerShell title="My Orders">
      <div className="flex flex-col gap-2 px-4 pt-3">
        <h1 className="font-display text-[20px] font-semibold">My Orders ({orders.length})</h1>
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl bg-surface-container-lowest p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-primary">#{o.orderNo}</span>
              <span className="text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 truncate text-sm font-medium">{o.itemName}</p>
            <p className="text-xs text-on-surface-variant">{o.merchantName}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[16px] font-semibold">{formatNaira(o.total)}</span>
              <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[11px] font-medium text-on-secondary-fixed-variant capitalize">
                {o.fulfillmentStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </BuyerShell>
  );
}
