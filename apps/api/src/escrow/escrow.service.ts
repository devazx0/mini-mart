import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EscrowService {
  constructor(private readonly prisma: PrismaService) {}

  async createForOrder(orderId: string): Promise<Record<string, unknown>> {
    const expiresAt = new Date(Date.now() + (29 * 60 + 45) * 1000);
    const escrow = await this.prisma.escrowTransaction.create({
      data: {
        orderId,
        bankName: "Wema Bank",
        accountName: "ApexMarket Escrow",
        accountNumber: "0123456789",
        status: "pending",
        expiresAt,
      },
    });
    return {
      orderId: escrow.orderId,
      orderNo: "",
      bankName: escrow.bankName,
      accountName: escrow.accountName,
      accountNumber: escrow.accountNumber,
      expiresAt: escrow.expiresAt.toISOString(),
      status: escrow.status,
    };
  }

  async lock(orderId: string, buyerId: string): Promise<{ ok: boolean }> {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, buyerId } });
    if (!order) throw new Error("Order not found");
    await this.prisma.$transaction([
      this.prisma.escrowTransaction.update({
        where: { orderId },
        data: { status: "locked", lockedAt: new Date() },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { escrowStatus: "held" },
      }),
    ]);
    return { ok: true };
  }
}
