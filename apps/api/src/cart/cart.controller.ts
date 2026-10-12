import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { IsInt, IsString, Max, Min } from "class-validator";
import { CurrentUser, type AuthUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartService } from "./cart.service";

class AddDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  qty!: number;
}

class QtyDto {
  @IsInt()
  @Min(0)
  @Max(99)
  qty!: number;
}

@UseGuards(JwtAuthGuard)
@Controller("api/cart")
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: AuthUser): Promise<Record<string, unknown>> {
    return this.cart.summary(user.sub);
  }

  @Post()
  add(@CurrentUser() user: AuthUser, @Body() dto: AddDto): Promise<Record<string, unknown>> {
    return this.cart.add(user.sub, dto.productId, dto.qty);
  }

  @Patch(":productId")
  setQty(
    @CurrentUser() user: AuthUser,
    @Param("productId") productId: string,
    @Body() dto: QtyDto,
  ): Promise<Record<string, unknown>> {
    return this.cart.setQty(user.sub, productId, dto.qty);
  }

  @Delete(":productId")
  remove(@CurrentUser() user: AuthUser, @Param("productId") productId: string): Promise<Record<string, unknown>> {
    return this.cart.remove(user.sub, productId);
  }
}
