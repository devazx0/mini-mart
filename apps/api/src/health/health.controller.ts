import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("db")
  async db(): Promise<{ ok: boolean; database: string; products: number }> {
    const rows = await this.prisma.$queryRaw<Array<{ database: string }>>`
      SELECT current_database() AS database
    `;
    const products = await this.prisma.product.count();
    return { ok: true, database: rows[0]?.database ?? "unknown", products };
  }
}
