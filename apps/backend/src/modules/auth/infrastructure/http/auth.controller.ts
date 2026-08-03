import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import type { LoginUserUseCase, RefreshTokenUseCase, RegisterUserUseCase } from "../../domain/ports.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas.js";

@injectable()
export class AuthController {
  constructor(
    @inject(DI_TOKENS.RegisterUserUseCase) private readonly registerUserUseCase: RegisterUserUseCase,
    @inject(DI_TOKENS.LoginUserUseCase) private readonly loginUserUseCase: LoginUserUseCase,
    @inject(DI_TOKENS.RefreshTokenUseCase) private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const dto = registerSchema.parse(req.body);
    const result = await this.registerUserUseCase.execute(dto);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const dto = loginSchema.parse(req.body);
    const result = await this.loginUserUseCase.execute(dto);
    res.status(200).json(result);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const dto = refreshSchema.parse(req.body);
    const result = await this.refreshTokenUseCase.execute(dto);
    res.status(200).json(result);
  };
}
