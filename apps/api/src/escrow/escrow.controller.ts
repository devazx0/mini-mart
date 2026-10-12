import { Controller, NotFoundException, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EscrowService } from "./escrow.service";

@UseGuards(JwtAuthGuard)
@Controller("api/escrow")
export class EscrowController {
  constructor(private readonly escrow: EscrowService) {}

  @Post(":orderId/lock")
  async lock(@CurrentUser() user: AuthUser, @Param("orderId") orderId: string): Promise<{ ok: boolean }> {
    try {
      return await this.escrow.lock(orderId, user.sub);
    } catch {
      throw new NotFoundException("Order not found");
    }
  }
}
