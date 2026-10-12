export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dob: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProduct extends Product {
  sellerId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  storeName: string;
  storeLocation: string;
  verified: boolean;
}

export interface SellerProductInput {
  name: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  stock?: number;
  imageUrl?: string;
  category?: string;
  categorySlug?: string;
  freeDelivery?: boolean;
  badge?: string | null;
  storeName?: string;
  storeLocation?: string;
  active?: boolean;
}

export interface SellerOrderItem {
  itemId: string;
  orderId: string;
  orderNo: string;
  createdAt: string;
  buyerId: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  productId: string;
  productName: string;
  imageUrl: string;
  storeName: string;
  paymentMethod: string;
  escrowStatus: string;
  fulfillmentStatus: string;
}

export interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  totalOrders: number;
  pendingFulfillment: number;
  totalRevenue: number;
  pendingRevenue: number;
  settledRevenue: number;
}
export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dob: string; // ISO string
  role?: "buyer" | "seller";
}

export interface LoginInput {
  email: string;
  password: string;
}

export type PaymentMethod = "transfer" | "card" | "wallet";
export type EscrowStatus = "required" | "held" | "released" | "refunded";
export type FulfillmentStatus = "processing" | "shipped" | "delivered" | "completed";

export interface SellerInfo {
  id: string;
  storeName: string;
  location: string;
  verified: boolean;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  imageUrl: string;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  freeDelivery?: boolean;
  badge?: string | null;
  seller: SellerInfo;
}

export interface CartItem {
  productId: string;
  qty: number;
  product: Product;
}

export interface CartSummary {
  items: CartItem[];
  count: number;
  subtotal: number;
  shippingFee: number;
  total: number;
}

export interface BuyerStats {
  totalOrders: number;
  pending: number;
  completed: number;
  totalSpent: number;
  deltaMonth: number;
}

export interface OrderItemView {
  productId: string;
  name: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
  storeName: string;
}

export interface OrderView {
  id: string;
  orderNo: string;
  createdAt: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  escrowStatus: EscrowStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItemView[];
  merchantName: string;
  itemName: string;
}

export interface TrackingMilestone {
  title: string;
  subtitle: string;
  done: boolean;
  active?: boolean;
  icon: string;
}

export interface EscrowInfo {
  orderId: string;
  orderNo: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  expiresAt: string;
  status: string;
}

export interface WalletInfo {
  balance: number;
  remainingAfterCheckout?: number;
}

export interface BuyerNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
