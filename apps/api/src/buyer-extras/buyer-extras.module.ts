import { Controller, Get, Module, Param, Patch, UseGuards } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser, type AuthUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<Record<string, unknown>> {
    const wallet = await this.prisma.walletAccount.upsert({
      where: { userId },
      create: { userId, balance: 120000 },
      update: {},
    });
    const balance = Number(String(wallet.balance));
    return { balance, remainingAfterCheckout: balance - 75500 };
  }
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<Record<string, unknown>[]> {
    let rows = await this.prisma.buyerNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    if (rows.length === 0) {
      const created = await this.prisma.buyerNotification.create({
        data: { userId, title: "Order Update", body: "Order #ORD-10291 confirmed by TechHub NG" },
      });
      rows = [created];
    }
    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      read: n.readAt != null,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  async markRead(userId: string, id: string): Promise<{ ok: boolean }> {
    await this.prisma.buyerNotification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}

@UseGuards(JwtAuthGuard)
@Controller("api/wallet")
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  get(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>> {
    return this.wallet.get(user.sub);
  }
}

@UseGuards(JwtAuthGuard)
@Controller("api/notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>[]> {
    return this.notifications.list(user.sub);
  }

  @Patch(":id/read")
  read(@CurrentUser() user: AuthUser, @Param("id") id: string): Promise<{ ok: boolean }> {
    return this.notifications.markRead(user.sub, id);
  }
}

@Module({
  controllers: [WalletController, NotificationsController],
  providers: [WalletService, NotificationsService],
})
export class BuyerExtrasModule {}
