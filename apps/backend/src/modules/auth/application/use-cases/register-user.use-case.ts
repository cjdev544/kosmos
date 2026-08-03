import { inject, injectable } from "tsyringe";
import { randomUUID } from "node:crypto";
import { ConflictError } from "../../../../shared/domain/errors.js";
import { User } from "../../domain/user.entity.js";
import type {
  AuthResult,
  PasswordHasher,
  RegisterUserInput,
  RegisterUserUseCase as RegisterUserUseCasePort,
  TokenService,
  UserRepository,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class RegisterUserUseCase implements RegisterUserUseCasePort {
  constructor(
    @inject(DI_TOKENS.UserRepository) private readonly userRepository: UserRepository,
    @inject(DI_TOKENS.PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @inject(DI_TOKENS.TokenService) private readonly tokenService: TokenService,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Ya existe un usuario con este correo electrónico");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const now = new Date();
    const user = User.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    });

    await this.userRepository.save(user);

    return {
      user: user.toPublic(),
      tokens: this.tokenService.generateTokenPair(user.id),
    };
  }
}
