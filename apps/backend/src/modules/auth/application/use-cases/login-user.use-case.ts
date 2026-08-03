import { inject, injectable } from "tsyringe";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type {
  AuthResult,
  LoginUserInput,
  LoginUserUseCase as LoginUserUseCasePort,
  PasswordHasher,
  TokenService,
  UserRepository,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class LoginUserUseCase implements LoginUserUseCasePort {
  constructor(
    @inject(DI_TOKENS.UserRepository) private readonly userRepository: UserRepository,
    @inject(DI_TOKENS.PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @inject(DI_TOKENS.TokenService) private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    return {
      user: user.toPublic(),
      tokens: this.tokenService.generateTokenPair(user.id),
    };
  }
}
