import { inject, injectable } from "tsyringe";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type {
  AuthResult,
  RefreshTokenInput,
  RefreshTokenUseCase as RefreshTokenUseCasePort,
  TokenService,
  UserRepository,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class RefreshTokenUseCase implements RefreshTokenUseCasePort {
  constructor(
    @inject(DI_TOKENS.UserRepository) private readonly userRepository: UserRepository,
    @inject(DI_TOKENS.TokenService) private readonly tokenService: TokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<AuthResult> {
    const { sub: userId } = this.tokenService.verifyRefreshToken(input.refreshToken);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("Token de refresco inválido o expirado");
    }

    return {
      user: user.toPublic(),
      tokens: this.tokenService.generateTokenPair(user.id),
    };
  }
}
