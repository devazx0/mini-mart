import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const SHIPPING_FLAT = 2500;

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  if (v != null && typeof (v as { toString: () => string }).toString === "function") {
    return Number((v as { toString: () => string }).toString());
  }
  return 0;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private toView(product: Record<string, unknown>): Record<string, unknown> {
    const rating = num(product["rating"]);
    return {
      id: product["id"],
      name: product["name"],
      description: product["description"],
      price: num(product["price"]),
      oldPrice: product["oldPrice"] == null ? null : num(product["oldPrice"]),
      stock: product["stock"],
      imageUrl: product["imageUrl"],
      category: product["category"],
      categorySlug: product["categorySlug"],
      rating,
      reviewCount: product["reviewCount"],
      freeDelivery: product["freeDelivery"],
      badge: product["badge"],
      seller: {
        id: `s-${String(product["storeName"])}`,
        storeName: product["storeName"],
        location: product["storeLocation"],
        verified: product["verified"],
        rating,
      },
    };
  }

  async summary(userId: string): Promise<Record<string, unknown>> {
    const rows = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });
    const items = rows.map((r) => ({
      productId: r.productId,
      qty: r.qty,
      product: this.toView(r.product as unknown as Record<string, unknown>),
    }));
    const subtotal = rows.reduce((s, r) => s + num((r.product as unknown as Record<string, unknown>)["price"]) * r.qty, 0);
    const shippingFee = items.length === 0 ? 0 : SHIPPING_FLAT;
    return { items, count: rows.reduce((s, r) => s + r.qty, 0), subtotal, shippingFee, total: subtotal + shippingFee };
  }

  async add(userId: string, productId: string, qty: number): Promise<Record<string, unknown>> {
    if (!productId || qty < 1 || qty > 99) throw new BadRequestException("Invalid qty");
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) throw new NotFoundException("Product not found");
    await this.prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, qty },
      update: { qty: { increment: qty } },
    });
    return this.summary(userId);
  }

  async setQty(userId: string, productId: string, qty: number): Promise<Record<string, unknown>> {
    if (qty < 0 || qty > 99) throw new BadRequestException("Invalid qty");
    if (qty === 0) {
      await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
      return this.summary(userId);
    }
    const existing = await this.prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } });
    if (!existing) throw new NotFoundException("Cart item not found");
    await this.prisma.cartItem.update({ where: { userId_productId: { userId, productId } }, data: { qty } });
    return this.summary(userId);
  }

  async remove(userId: string, productId: string): Promise<Record<string, unknown>> {
    await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
    return this.summary(userId);
  }

  async clear(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
