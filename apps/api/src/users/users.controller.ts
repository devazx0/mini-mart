import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser, type AuthUser } from "../auth/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("api/users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser): Promise<unknown> {
    return this.users.me(user.sub);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMeDto,
  ): Promise<unknown> {
    return this.users.updateMe(user.sub, dto);
  }

  @Get()
  @Roles("admin")
  findAll(): Promise<unknown> {
    return this.users.findAll();
  }

  @Patch(":id/role")
  @Roles("admin")
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<unknown> {
    return this.users.updateRole(id, dto.role);
  }
}
