import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module";
import { EscrowModule } from "../escrow/escrow.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CartModule, EscrowModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
