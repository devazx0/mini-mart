import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomUUID } from "node:crypto";
import argon2 from "argon2";
import { plainToInstance } from "class-transformer";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import type { SignupDto } from "./dto/signup.dto";
import type { LoginDto } from "./dto/login.dto";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { UsersService } from "src/users/users.service";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/auth";

function sha256(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toResponse(user: Record<string, unknown>): UserResponseDto {
  const { password: _password, ...rest } = user;
  return plainToInstance(UserResponseDto, rest);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  private accessTtl(): number {
    return Number(this.config.get("ACCESS_TOKEN_TTL") ?? 900);
  }

  private refreshTtl(): number {
    return Number(this.config.get("REFRESH_TOKEN_TTL") ?? 604800);
  }

  private cookieBase(secure: boolean): {
    httpOnly: true;
    secure: boolean;
    sameSite: "lax";
  } {
    return { httpOnly: true, secure, sameSite: "lax" };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = this.config.get("NODE_ENV") === "production";
    res.cookie(ACCESS_COOKIE, accessToken, {
      ...this.cookieBase(secure),
      path: "/",
      maxAge: this.accessTtl() * 1000,
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...this.cookieBase(secure),
      path: REFRESH_COOKIE_PATH,
      maxAge: this.refreshTtl() * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  private async issuePair(
    user: { id: string; email: string; role: string },
    res: Response,
  ): Promise<UserResponseDto> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.accessTtl(),
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.refreshTtl(),
      },
    );
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshTtl() * 1000),
      },
    });
    this.setAuthCookies(res, accessToken, refreshToken);
    const full = await this.prisma.user.findUnique({ where: { id: user.id } });
    return toResponse(full ?? user);
  }

  async signup(dto: SignupDto, res: Response): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException("Email already registered");
    const password = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password,
        phone: dto.phone ?? null,
        dob: dto.dob,
        role: dto.role ?? "buyer",
      },
    });
    return this.issuePair(
      { id: user.id, email: user.email, role: user.role },
      res,
    );
  }

  async login(dto: LoginDto, res: Response): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await argon2.verify(user.password, dto.password);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    return this.issuePair(
      { id: user.id, email: user.email, role: user.role },
      res,
    );
  }

  async refresh(token: string | undefined, res: Response): Promise<UserResponseDto> {
    if (!token) throw new UnauthorizedException("Missing refresh token");
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
    const hash = sha256(token);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Possible reuse: if token decodes but DB row is revoked, wipe all sessions.
      if (stored?.revokedAt && payload.sub) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException("Invalid refresh token");
    }
    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });
    if (!user) throw new UnauthorizedException("Invalid refresh token");

    // Rotate: revoke old, issue new pair.
    const replacement = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.refreshTtl(),
      },
    );
    const created = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(replacement),
        expiresAt: new Date(Date.now() + this.refreshTtl() * 1000),
      },
    });
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: created.id },
    });
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.accessTtl(),
      },
    );
    this.setAuthCookies(res, accessToken, replacement);
    return toResponse(user);
  }

  async logout(token: string | undefined, res: Response): Promise<{ message: string }> {
    if (token) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash: sha256(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    this.clearAuthCookies(res);
    return { message: "Logged out" };
  }
}
