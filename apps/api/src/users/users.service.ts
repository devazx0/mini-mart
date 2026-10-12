import { Injectable, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../prisma/prisma.service";
import { UserResponseDto } from "./dto/user-response.dto";
import type { UpdateMeDto } from "./dto/update-me.dto";
import type { UpdatableRole } from "./dto/update-role.dto";

function toResponse(user: Record<string, unknown>): UserResponseDto {
  const { password: _password, ...rest } = user;
  return plainToInstance(UserResponseDto, rest);
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    return toResponse(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.dob !== undefined ? { dob: dto.dob } : {}),
      },
    });
    return toResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return users.map((u) => toResponse(u));
  }

  async updateRole(userId: string, role: UpdatableRole): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return toResponse(user);
  }
}
