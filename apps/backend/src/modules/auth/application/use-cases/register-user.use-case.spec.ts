import { describe, expect, it, vi } from "vitest";
import { RegisterUserUseCase } from "./register-user.use-case.js";
import { ConflictError } from "../../../../shared/domain/errors.js";
import type { PasswordHasher, TokenService, UserRepository } from "../../domain/ports.js";
import { buildUser } from "../../../../../test/factories.js";

function buildDeps(overrides: {
  userRepository?: Partial<UserRepository>;
  passwordHasher?: Partial<PasswordHasher>;
  tokenService?: Partial<TokenService>;
} = {}) {
  const userRepository: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides.userRepository,
  };
  const passwordHasher: PasswordHasher = {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
    ...overrides.passwordHasher,
  };
  const tokenService: TokenService = {
    generateTokenPair: vi.fn().mockReturnValue({ accessToken: "access", refreshToken: "refresh" }),
    verifyRefreshToken: vi.fn(),
    ...overrides.tokenService,
  };
  return { userRepository, passwordHasher, tokenService };
}

describe("RegisterUserUseCase", () => {
  it("registers a new user and returns tokens", async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps();
    const useCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute({ email: "new@example.com", password: "secret123", name: "New User" });

    expect(passwordHasher.hash).toHaveBeenCalledWith("secret123");
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(result.user).toMatchObject({ email: "new@example.com", name: "New User" });
    expect(result.tokens).toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("throws ConflictError when the email is already registered", async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps({
      userRepository: { findByEmail: vi.fn().mockResolvedValue(buildUser()) },
    });
    const useCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);

    await expect(
      useCase.execute({ email: "user@example.com", password: "secret123", name: "New User" }),
    ).rejects.toThrow(ConflictError);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it("generates the token pair using the newly created user id", async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps();
    const useCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute({ email: "new@example.com", password: "secret123", name: "New User" });

    expect(tokenService.generateTokenPair).toHaveBeenCalledWith(result.user.id);
  });
});
