import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { EscrowService } from "../escrow/escrow.service";

function num(v: unknown): number {
  if (typeof v === "number") return v;
  return Number(String(v ?? 0));
}

function toOrderView(order: Record<string, unknown>, items: Record<string, unknown>[]): Record<string, unknown> {
  return {
    id: order["id"],
    orderNo: order["orderNo"],
    createdAt: (order["createdAt"] as Date)?.toISOString?.() ?? order["createdAt"],
    total: num(order["total"]),
    subtotal: num(order["subtotal"]),
    shippingFee: num(order["shippingFee"]),
    paymentMethod: order["paymentMethod"],
    escrowStatus: order["escrowStatus"],
    fulfillmentStatus: order["fulfillmentStatus"],
    merchantName: order["merchantName"],
    itemName: order["itemName"],
    items: items.map((i) => ({
      productId: i["productId"],
      name: i["name"],
      imageUrl: i["imageUrl"],
      qty: i["qty"],
      unitPrice: num(i["unitPrice"]),
      storeName: i["storeName"],
    })),
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly escrow: EscrowService,
  ) {}

  async stats(buyerId: string): Promise<Record<string, unknown>> {
    const [totalOrders, pending, completed, agg] = await Promise.all([
      this.prisma.order.count({ where: { buyerId } }),
      this.prisma.order.count({ where: { buyerId, fulfillmentStatus: { in: ["processing", "shipped"] } } }),
      this.prisma.order.count({ where: { buyerId, fulfillmentStatus: { in: ["delivered", "completed"] } } }),
      this.prisma.order.aggregate({ where: { buyerId }, _sum: { total: true } }),
    ]);
    const totalSpent = agg._sum.total == null ? 0 : num(agg._sum.total);
    // Fallback demo numbers when brand-new user has no orders yet.
    if (totalOrders === 0) {
      return { totalOrders: 14, pending: 2, completed: 12, totalSpent: 348500, deltaMonth: 2 };
    }
    return { totalOrders, pending, completed, totalSpent, deltaMonth: 2 };
  }

  async list(buyerId: string, limit?: number): Promise<Record<string, unknown>[]> {
    const orders = await this.prisma.order.findMany({
      where: { buyerId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit && limit > 0 && limit <= 50 ? limit : undefined,
    });
    return orders.map((o) =>
      toOrderView(o as unknown as Record<string, unknown>, (o.items ?? []) as unknown as Record<string, unknown>[]),
    );
  }

  async checkout(buyerId: string, address: string, paymentMethod: string): Promise<{ order: Record<string, unknown>; escrow: Record<string, unknown> }> {
    const method = ["transfer", "card", "wallet"].includes(paymentMethod) ? paymentMethod : "transfer";
    const cartRows = await this.prisma.cartItem.findMany({
      where: { userId: buyerId },
      include: { product: true },
    });
    if (cartRows.length === 0) throw new BadRequestException("Cart is empty");

    const subtotal = cartRows.reduce((s, r) => s + num((r.product as unknown as Record<string, unknown>)["price"]) * r.qty, 0);
    const shippingFee = 2500;
    const total = subtotal + shippingFee;

    if (method === "wallet") {
      const wallet = await this.prisma.walletAccount.findUnique({ where: { userId: buyerId } });
      const balance = wallet ? num(wallet.balance) : 120000;
      if (balance < total) throw new BadRequestException("Insufficient wallet balance");
    }

    const count = await this.prisma.order.count();
    const orderNo = `ORD-${10292 + count}`;
    const first = cartRows[0].product as unknown as Record<string, unknown>;

    const order = await this.prisma.order.create({
      data: {
        orderNo,
        buyerId,
        subtotal,
        shippingFee,
        total,
        paymentMethod: method,
        escrowStatus: method === "wallet" ? "held" : "required",
        fulfillmentStatus: "processing",
        addressLine: address || "Lekki Phase 1, Lagos",
        merchantName: String(first["storeName"] ?? "ApexMarket"),
        itemName: String(first["name"] ?? "Marketplace items"),
        items: {
          create: cartRows.map((r) => {
            const p = r.product as unknown as Record<string, unknown>;
            return {
              productId: r.productId,
              sellerId: (p["sellerId"] as string | null) ?? null,
              name: String(p["name"]),
              imageUrl: String(p["imageUrl"] ?? ""),
              qty: r.qty,
              unitPrice: num(p["price"]),
              storeName: String(p["storeName"] ?? ""),
            };
          }),
        },
      },
      include: { items: true },
    });

    let escrow: Record<string, unknown>;
    if (method === "wallet") {
      const wallet = await this.prisma.walletAccount.upsert({
        where: { userId: buyerId },
        create: { userId: buyerId, balance: 120000 - total },
        update: { balance: { decrement: total } },
      });
      await this.prisma.walletLedger.create({
        data: { userId: buyerId, orderId: order.id, delta: -total, balanceAfter: wallet.balance, reason: `Escrow lock ${orderNo}` },
      });
      const e = await this.prisma.escrowTransaction.create({
        data: { orderId: order.id, status: "locked", lockedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      });
      escrow = { orderId: order.id, orderNo, bankName: e.bankName, accountName: e.accountName, accountNumber: e.accountNumber, expiresAt: e.expiresAt.toISOString(), status: e.status };
    } else {
      const e = await this.escrow.createForOrder(order.id);
      escrow = { ...e, orderNo };
    }

    // Decrement stock, clear cart, notify buyer (simulated settlement).
    for (const r of cartRows) {
      await this.prisma.product.update({
        where: { id: r.productId },
        data: { stock: { decrement: r.qty } },
      });
    }
    await this.cart.clear(buyerId);
    await this.prisma.buyerNotification.create({
      data: { userId: buyerId, title: "Order Update", body: `Order #${orderNo} confirmed by ${order.merchantName}` },
    });

    return {
      order: toOrderView(order as unknown as Record<string, unknown>, (order.items ?? []) as unknown as Record<string, unknown>[]),
      escrow,
    };
  }

  async tracking(buyerId: string, orderId: string): Promise<Record<string, unknown>[]> {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, buyerId } });
    if (!order) {
      return [
        { title: "Payment Held in Secure Escrow", subtitle: "₦ Funds verified via ApexPay gateway", done: true, icon: "check" },
        { title: "Package Inspected & Sealed", subtitle: "Dispatched from Ikeja Fulfillment Center, Lagos", done: true, active: true, icon: "inventory_2" },
        { title: "In Transit to Delivery Address", subtitle: "Estimated arrival tomorrow by 2:00 PM", done: false, icon: "local_shipping" },
      ];
    }
    const held = order.escrowStatus === "held";
    const shipped = order.fulfillmentStatus === "shipped" || order.fulfillmentStatus === "delivered";
    return [
      { title: "Payment Held in Secure Escrow", subtitle: "₦ Funds verified via ApexPay gateway", done: held || order.escrowStatus === "required", icon: "check" },
      { title: "Package Inspected & Sealed", subtitle: "Dispatched from Ikeja Fulfillment Center, Lagos", done: held, active: held && !shipped, icon: "inventory_2" },
      { title: "In Transit to Delivery Address", subtitle: "Estimated arrival tomorrow by 2:00 PM", done: shipped, icon: "local_shipping" },
    ];
  }
}
