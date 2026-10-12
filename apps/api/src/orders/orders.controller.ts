import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { CurrentUser, type AuthUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrdersService } from "./orders.service";

class CheckoutDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsIn(["transfer", "card", "wallet"])
  paymentMethod!: string;
}

@UseGuards(JwtAuthGuard)
@Controller("api/orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get("stats")
  stats(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>> {
    return this.orders.stats(user.sub);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query("limit") limit?: string): Promise<Record<string, unknown>[]> {
    const n = limit ? Number(limit) : undefined;
    return this.orders.list(user.sub, Number.isFinite(n) ? Number(n) : undefined);
  }

  @Post("checkout")
  checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto): Promise<{ order: Record<string, unknown>; escrow: Record<string, unknown> }> {
    return this.orders.checkout(user.sub, dto.address ?? "Lekki Phase 1, Lagos", dto.paymentMethod);
  }

  @Get(":id/tracking")
  tracking(@CurrentUser() user: AuthUser, @Param("id") id: string): Promise<Record<string, unknown>[]> {
    return this.orders.tracking(user.sub, id);
  }
}
