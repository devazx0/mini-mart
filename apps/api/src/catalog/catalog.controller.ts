import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

@Controller("api/products")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("category") category?: string,
    @Query("sort") sort?: string,
  ): Promise<{ items: unknown[]; total: number }> {
    return this.catalog.list({ search, category, sort });
  }

  @Get(":id")
  async get(@Param("id") id: string): Promise<unknown> {
    const p = await this.catalog.getById(id);
    if (!p) throw new NotFoundException("Product not found");
    return p;
  }
}
