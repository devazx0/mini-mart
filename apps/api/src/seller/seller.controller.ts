import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateFulfillmentDto } from "./dto/update-fulfillment.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SellerService } from "./seller.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("seller", "admin")
@Controller("api/seller")
export class SellerController {
  constructor(private readonly seller: SellerService) {}

  @Get("products")
  products(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>[]> {
    return this.seller.listProducts(user);
  }

  @Post("products")
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto): Promise<Record<string, unknown>> {
    return this.seller.createProduct(user, dto);
  }

  @Patch("products/:id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Record<string, unknown>> {
    return this.seller.updateProduct(user, id, dto);
  }

  @Delete("products/:id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string): Promise<{ ok: boolean }> {
    return this.seller.removeProduct(user, id);
  }

  @Get("orders")
  orders(
    @CurrentUser() user: AuthUser,
    @Query("limit") limit?: string,
  ): Promise<Record<string, unknown>[]> {
    const n = limit ? Number(limit) : undefined;
    return this.seller.listOrders(user, Number.isFinite(n) ? Number(n) : undefined);
  }

  @Patch("orders/:orderId/fulfillment")
  fulfillment(
    @CurrentUser() user: AuthUser,
    @Param("orderId") orderId: string,
    @Body() dto: UpdateFulfillmentDto,
  ): Promise<Record<string, unknown>> {
    return this.seller.updateFulfillment(user, orderId, dto.status);
  }

  @Get("stats")
  stats(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>> {
    return this.seller.stats(user);
  }
}
