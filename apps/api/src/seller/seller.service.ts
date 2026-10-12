import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "../auth/decorators/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

function num(v: unknown): number {
  if (typeof v === "number") return v;
  return Number(String(v ?? 0));
}

function toProductView(p: Record<string, unknown>): Record<string, unknown> {
  const rating = num(p["rating"]);
  return {
    id: p["id"],
    sellerId: p["sellerId"] ?? null,
    name: p["name"],
    description: p["description"],
    price: num(p["price"]),
    oldPrice: p["oldPrice"] == null ? null : num(p["oldPrice"]),
    stock: p["stock"],
    imageUrl: p["imageUrl"],
    category: p["category"],
    categorySlug: p["categorySlug"],
    rating,
    reviewCount: p["reviewCount"],
    freeDelivery: p["freeDelivery"],
    badge: p["badge"],
    active: p["active"],
    storeName: p["storeName"],
    storeLocation: p["storeLocation"],
    verified: p["verified"],
    createdAt: p["createdAt"],
    updatedAt: p["updatedAt"],
    seller: {
      id: p["sellerId"] ? String(p["sellerId"]) : `s-${String(p["storeName"])}`,
      storeName: p["storeName"],
      location: p["storeLocation"],
      verified: p["verified"],
      rating,
    },
  };
}

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  private isAdmin(user: AuthUser): boolean {
    return user.role === "admin";
  }

  async listProducts(user: AuthUser): Promise<Record<string, unknown>[]> {
    const rows = await this.prisma.product.findMany({
      where: this.isAdmin(user) ? {} : { sellerId: user.sub },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return rows.map((r) => toProductView(r as unknown as Record<string, unknown>));
  }

  async createProduct(user: AuthUser, dto: CreateProductDto): Promise<Record<string, unknown>> {
    const seller = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!seller) throw new ForbiddenException("Seller account not found");
    const created = await this.prisma.product.create({
      data: {
        sellerId: user.sub,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? "",
        price: dto.price,
        oldPrice: dto.oldPrice ?? null,
        stock: dto.stock ?? 0,
        imageUrl: dto.imageUrl ?? "",
        category: dto.category?.trim() || "general",
        categorySlug: dto.categorySlug?.trim() || "all",
        freeDelivery: dto.freeDelivery ?? false,
        badge: dto.badge ?? null,
        storeName: dto.storeName?.trim() || `${seller.firstName} Stores`,
        storeLocation: dto.storeLocation?.trim() || "Lagos",
        active: dto.active ?? true,
      },
    });
    return toProductView(created as unknown as Record<string, unknown>);
  }

  async updateProduct(
    user: AuthUser,
    id: string,
    dto: UpdateProductDto,
  ): Promise<Record<string, unknown>> {
    const existing = await this.prisma.product.findFirst({
      where: this.isAdmin(user) ? { id } : { id, sellerId: user.sub },
    });
    if (!existing) throw new NotFoundException("Product not found");
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.oldPrice !== undefined ? { oldPrice: dto.oldPrice } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.category !== undefined ? { category: dto.category.trim() || "general" } : {}),
        ...(dto.categorySlug !== undefined ? { categorySlug: dto.categorySlug.trim() || "all" } : {}),
        ...(dto.freeDelivery !== undefined ? { freeDelivery: dto.freeDelivery } : {}),
        ...(dto.badge !== undefined ? { badge: dto.badge } : {}),
        ...(dto.storeName !== undefined ? { storeName: dto.storeName.trim() } : {}),
        ...(dto.storeLocation !== undefined ? { storeLocation: dto.storeLocation.trim() } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });
    return toProductView(updated as unknown as Record<string, unknown>);
  }

  async removeProduct(user: AuthUser, id: string): Promise<{ ok: boolean }> {
    const existing = await this.prisma.product.findFirst({
      where: this.isAdmin(user) ? { id } : { id, sellerId: user.sub },
    });
    if (!existing) throw new NotFoundException("Product not found");
    // Soft-delete: keep row for order history, hide from storefront.
    await this.prisma.product.update({ where: { id }, data: { active: false } });
    return { ok: true };
  }

  async listOrders(user: AuthUser, limit?: number): Promise<Record<string, unknown>[]> {
    const take = limit && limit > 0 && limit <= 100 ? limit : 50;
    const items = await this.prisma.orderItem.findMany({
      where: this.isAdmin(user) ? {} : { sellerId: user.sub },
      include: { order: true },
      orderBy: { order: { createdAt: "desc" } },
      take,
    });
    return items.map((i) => {
      const o = i.order as unknown as Record<string, unknown>;
      return {
        itemId: i.id,
        orderId: i.orderId,
        orderNo: o["orderNo"],
        createdAt: (o["createdAt"] as Date)?.toISOString?.() ?? o["createdAt"],
        buyerId: o["buyerId"],
        qty: i.qty,
        unitPrice: num(i.unitPrice),
        lineTotal: num(i.unitPrice) * i.qty,
        productId: i.productId,
        productName: i.name,
        imageUrl: i.imageUrl,
        storeName: i.storeName,
        paymentMethod: o["paymentMethod"],
        escrowStatus: o["escrowStatus"],
        fulfillmentStatus: o["fulfillmentStatus"],
      };
    });
  }

  async updateFulfillment(
    user: AuthUser,
    orderId: string,
    status: string,
  ): Promise<Record<string, unknown>> {
    const owned = await this.prisma.orderItem.findFirst({
      where: this.isAdmin(user) ? { orderId } : { orderId, sellerId: user.sub },
    });
    if (!owned) throw new NotFoundException("Order not found for this seller");
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: status },
    });
    return {
      orderId: updated.id,
      orderNo: updated.orderNo,
      fulfillmentStatus: updated.fulfillmentStatus,
    };
  }

  async stats(user: AuthUser): Promise<Record<string, unknown>> {
    const where = this.isAdmin(user) ? {} : { sellerId: user.sub };
    const [products, items] = await Promise.all([
      this.prisma.product.findMany({ where }),
      this.prisma.orderItem.findMany({
        where,
        include: { order: true },
      }),
    ]);
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.active).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const lowStock = products.filter((p) => p.stock >= 1 && p.stock <= 3).length;

    const orderIds = new Set(items.map((i) => i.orderId));
    const revenue = items.reduce((s, i) => s + num(i.unitPrice) * i.qty, 0);
    const pendingItems = items.filter((i) => {
      const o = i.order as unknown as Record<string, unknown> | null;
      const f = o?.["fulfillmentStatus"];
      return f === "processing" || f === "shipped";
    });
    const pendingRevenue = pendingItems.reduce((s, i) => s + num(i.unitPrice) * i.qty, 0);
    const settledRevenue = revenue - pendingRevenue;

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      totalOrders: orderIds.size,
      pendingFulfillment: new Set(pendingItems.map((i) => i.orderId)).size,
      totalRevenue: revenue,
      pendingRevenue,
      settledRevenue,
    };
  }
}
