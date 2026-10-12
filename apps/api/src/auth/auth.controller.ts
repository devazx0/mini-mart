import { Body, Controller, HttpCode, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("signup")
  signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    return this.auth.signup(dto, res);
  }

  @Post("login")
  @HttpCode(200)
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    return this.auth.login(dto, res);
  }

  @Post("refresh")
  @HttpCode(200)
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const token = req.cookies?.["refreshToken"] as string | undefined;
    return this.auth.refresh(token, res);
  }

  @Post("logout")
  @HttpCode(200)
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const token = req.cookies?.["refreshToken"] as string | undefined;
    return this.auth.logout(token, res);
  }
}
