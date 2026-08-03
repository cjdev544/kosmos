import { container } from "tsyringe";
import { DI_TOKENS } from "../../shared/infrastructure/di/tokens.js";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case.js";
import { LoginUserUseCase } from "./application/use-cases/login-user.use-case.js";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.use-case.js";
import { BcryptPasswordHasher } from "./infrastructure/persistence/bcrypt-password-hasher.js";
import { JwtTokenService } from "./infrastructure/persistence/jwt-token-service.js";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma-user.repository.js";

export function registerAuthModule(): void {
  container.registerSingleton(DI_TOKENS.UserRepository, PrismaUserRepository);
  container.registerSingleton(DI_TOKENS.PasswordHasher, BcryptPasswordHasher);
  container.registerSingleton(DI_TOKENS.TokenService, JwtTokenService);
  container.registerSingleton(DI_TOKENS.RegisterUserUseCase, RegisterUserUseCase);
  container.registerSingleton(DI_TOKENS.LoginUserUseCase, LoginUserUseCase);
  container.registerSingleton(DI_TOKENS.RefreshTokenUseCase, RefreshTokenUseCase);
}
