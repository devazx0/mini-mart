import { apiFetch } from "./client";
import type {
  BuyerNotification,
  BuyerStats,
  CartSummary,
  EscrowInfo,
  OrderView,
  Product,
  TrackingMilestone,
  WalletInfo,
} from "./types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p-headphones",
    name: "Premium Wireless ANC Headphones",
    description: "Over-ear active noise cancellation, 40h battery.",
    price: 45000,
    oldPrice: 52000,
    stock: 18,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCs0hnBzyfeCyk2Iw1QIqwtAeY9EPdCUG5ipRrciozCABnTfLgMkF6n-30wFvuP7es2jUeHI1YajSZSg-aC64Diw4edbyZ29rLaoLaXjwJrqs-HIdCKK0oqnO-wXQg6CJPGSkIyD_iRI-leljwFVXO4KSBt_OVx-hdMo5hDarKiD3vugSR6c0twUlBcmFa3dMSf-2zygmtAb89_XeZvGW03Xlhl6Tez2xH5rphRmhY",
    category: "Audio",
    categorySlug: "audio",
    rating: 4.9,
    reviewCount: 142,
    freeDelivery: true,
    badge: "-13% OFF",
    seller: { id: "s-techhub", storeName: "TechHub NG", location: "Lagos State", verified: true, rating: 4.9 },
  },
  {
    id: "p-keyboard",
    name: "Mechanical Keyboard Hot-Swappable RGB",
    description: "Gateron Brown switches, compact layout.",
    price: 38500,
    stock: 3,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkrpdfkWVeC99DJQj8iWPgdy_Qd_Yn06EuOqBb3eoqfCMiyH3a93pj-ysSGYBhlK0Xbad3Z-jzwCOCu-3w2fBYUpJvCMHrBjEiK02hOiDA8vV4E-ZZj-K6UvrsOZcNHi9F_iGm9y58kGtd59xvx1OiP985B3iL1XXg7kvYU-TWnSXuY_xpB-ajqmOc-i_XWH7m8LlLJdyQm4blS3Zum2ZNcXE6bBnQ9SwGXipeTkw",
    category: "Computing",
    categorySlug: "computing",
    rating: 4.8,
    reviewCount: 89,
    badge: "Fast Selling",
    seller: { id: "s-adebayo", storeName: "Adebayo Stores", location: "Ibadan", verified: true, rating: 4.8 },
  },
  {
    id: "p-stand",
    name: "Minimalist Aluminum Laptop Riser",
    description: "Ergonomic foldable with carry pouch.",
    price: 28000,
    stock: 24,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBxxGqUdEVSY91zRmmiGcz9OwSM7cm40nqpADD4P1aIcVgMAVGfs70qrUiR5lR2MxaLE5uNAXai5FH-TI4wzQJZYqbZmi-OiJa9Xno23X5sM04meTQqYClTKIG_6icWaAP64xaymXgPfirygzXFdz1LmjFJF_E9fZWepkIeQbvA1zaB3WlXqRAHApvFZVyX57W2Ehapon6oOy7sodkrqDnLKy-jyVlz45Vp-3YuWw",
    category: "Home Office",
    categorySlug: "home-office",
    rating: 4.9,
    reviewCount: 210,
    badge: "Top Seller 2024",
    seller: { id: "s-urban", storeName: "Urban Essentials", location: "Abuja", verified: false, rating: 4.9 },
  },
  {
    id: "p-charger",
    name: "65W GaN Dual USB-C Fast Charger",
    description: "PD 3.0 / QC 4+, includes braided cable.",
    price: 16500,
    stock: 41,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOdR_gp4ADf4VhKaTlezPqmhuJcycZHGaN9GcbZLFinufz1SVJ2zfIWe1boMP28Ovs10fmFv8a1PxE5hKaST6EFu2aqi17v7FhmLIPmdw-c4ET8-DxsOy9YgmyvGRJyZuy9h3BjazH52JH2fA8IUy-Z6aFtHLt8xJJ5atyLcEczPXDA_7GCLi4Dc3QiflhdqTwBE86uK33MV4JWtecWegdOkRvwB0_XF7vJH2-Mno",
    category: "Accessories",
    categorySlug: "accessories",
    rating: 4.7,
    reviewCount: 64,
    seller: { id: "s-nova", storeName: "Nova Gadgets", location: "Port Harcourt", verified: true, rating: 4.7 },
  },
];

export const MOCK_STATS: BuyerStats = {
  totalOrders: 14,
  pending: 2,
  completed: 12,
  totalSpent: 348500,
  deltaMonth: 2,
};

export const MOCK_ORDERS: OrderView[] = [
  {
    id: "o-1",
    orderNo: "ORD-10291",
    createdAt: "2026-09-18T10:00:00.000Z",
    total: 45000,
    subtotal: 45000,
    shippingFee: 0,
    paymentMethod: "transfer",
    escrowStatus: "held",
    fulfillmentStatus: "processing",
    merchantName: "TechHub NG",
    itemName: "Wireless Over-Ear ANC Headphones",
    items: [
      {
        productId: "p-headphones",
        name: "Pro Wireless ANC Headphones",
        imageUrl: MOCK_PRODUCTS[0].imageUrl,
        qty: 1,
        unitPrice: 45000,
        storeName: "TechHub NG",
      },
    ],
  },
  {
    id: "o-2",
    orderNo: "ORD-10288",
    createdAt: "2026-09-14T10:00:00.000Z",
    total: 28000,
    subtotal: 28000,
    shippingFee: 0,
    paymentMethod: "transfer",
    escrowStatus: "held",
    fulfillmentStatus: "shipped",
    merchantName: "Urban Essentials",
    itemName: "Ergonomic Aluminum Laptop Stand",
    items: [
      {
        productId: "p-stand",
        name: "Aluminum Dual-Pivot Laptop Stand",
        imageUrl: MOCK_PRODUCTS[2].imageUrl,
        qty: 1,
        unitPrice: 28000,
        storeName: "Urban Essentials",
      },
    ],
  },
];

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export function listProducts(params?: {
  search?: string;
  category?: string;
  sort?: string;
}): Promise<{ items: Product[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.category && params.category !== "all") q.set("category", params.category);
  if (params?.sort) q.set("sort", params.sort);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return withFallback(
    () => apiFetch<{ items: Product[]; total: number }>(`/api/products${qs}`),
    (() => {
      let items = [...MOCK_PRODUCTS];
      if (params?.search) {
        const s = params.search.toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(s) ||
            p.seller.storeName.toLowerCase().includes(s),
        );
      }
      if (params?.category && params.category !== "all") {
        items = items.filter((p) => p.categorySlug === params.category);
      }
      if (params?.sort === "price-asc") items.sort((a, b) => a.price - b.price);
      if (params?.sort === "price-desc") items.sort((a, b) => b.price - a.price);
      return { items, total: 128 };
    })(),
  );
}

export function getBuyerStats(): Promise<BuyerStats> {
  return withFallback(() => apiFetch<BuyerStats>("/api/orders/stats"), MOCK_STATS);
}

export function getRecentOrders(limit = 2): Promise<OrderView[]> {
  return withFallback(
    () => apiFetch<OrderView[]>(`/api/orders?limit=${limit}`),
    MOCK_ORDERS.slice(0, limit),
  );
}

export function getOrders(): Promise<OrderView[]> {
  return withFallback(() => apiFetch<OrderView[]>("/api/orders"), MOCK_ORDERS);
}

export function getCart(): Promise<CartSummary> {
  const fallback: CartSummary = {
    items: [
      { productId: MOCK_PRODUCTS[0].id, qty: 1, product: MOCK_PRODUCTS[0] },
      { productId: MOCK_PRODUCTS[2].id, qty: 1, product: MOCK_PRODUCTS[2] },
    ],
    count: 2,
    subtotal: 73000,
    shippingFee: 2500,
    total: 75500,
  };
  return withFallback(() => apiFetch<CartSummary>("/api/cart"), fallback);
}

export function addToCart(productId: string, qty = 1): Promise<CartSummary> {
  return withFallback(
    () =>
      apiFetch<CartSummary>("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId, qty }),
      }),
    {
      items: [],
      count: 3,
      subtotal: 111500,
      shippingFee: 2500,
      total: 114000,
    },
  );
}

export function updateCartQty(productId: string, qty: number): Promise<CartSummary> {
  return apiFetch<CartSummary>(`/api/cart/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ qty }),
  });
}

export function removeFromCart(productId: string): Promise<CartSummary> {
  return apiFetch<CartSummary>(`/api/cart/${productId}`, { method: "DELETE" });
}

export function checkout(payload: {
  address: string;
  paymentMethod: "transfer" | "card" | "wallet";
}): Promise<{ order: OrderView; escrow: EscrowInfo }> {
  return withFallback(
    () =>
      apiFetch<{ order: OrderView; escrow: EscrowInfo }>("/api/orders/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    {
      order: MOCK_ORDERS[0],
      escrow: {
        orderId: MOCK_ORDERS[0].id,
        orderNo: MOCK_ORDERS[0].orderNo,
        bankName: "Wema Bank",
        accountName: "ApexMarket Escrow",
        accountNumber: "0123456789",
        expiresAt: new Date(Date.now() + 29 * 60 * 1000 + 45 * 1000).toISOString(),
        status: "pending",
      },
    },
  );
}

export function lockEscrow(orderId: string): Promise<{ ok: boolean }> {
  return withFallback(
    () =>
      apiFetch<{ ok: boolean }>(`/api/escrow/${orderId}/lock`, { method: "POST" }),
    { ok: true },
  );
}

export function getTracking(orderId: string): Promise<TrackingMilestone[]> {
  const fallback: TrackingMilestone[] = [
    { title: "Payment Held in Secure Escrow", subtitle: "₦ Funds verified via ApexPay gateway", done: true, icon: "check" },
    { title: "Package Inspected & Sealed", subtitle: "Dispatched from Ikeja Fulfillment Center, Lagos", done: true, active: true, icon: "inventory_2" },
    { title: "In Transit to Delivery Address", subtitle: "Estimated arrival tomorrow by 2:00 PM", done: false, icon: "local_shipping" },
  ];
  return withFallback(
    () => apiFetch<TrackingMilestone[]>(`/api/orders/${orderId}/tracking`),
    fallback,
  );
}

export function getWallet(): Promise<WalletInfo> {
  return withFallback(() => apiFetch<WalletInfo>("/api/wallet"), {
    balance: 120000,
    remainingAfterCheckout: 44500,
  });
}

export function getNotifications(): Promise<BuyerNotification[]> {
  return withFallback(() => apiFetch<BuyerNotification[]>("/api/notifications"), [
    {
      id: "n1",
      title: "Order Update",
      body: "Order #ORD-10291 confirmed by TechHub NG",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ]);
}

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString("en-NG")}`;
}
