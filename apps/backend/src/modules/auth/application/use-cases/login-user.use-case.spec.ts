import { describe, expect, it, vi } from "vitest";
import { LoginUserUseCase } from "./login-user.use-case.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type { PasswordHasher, TokenService, UserRepository } from "../../domain/ports.js";
import { buildUser } from "../../../../../test/factories.js";

function buildDeps(overrides: {
  userRepository?: Partial<UserRepository>;
  passwordHasher?: Partial<PasswordHasher>;
  tokenService?: Partial<TokenService>;
} = {}) {
  const userRepository: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(buildUser()),
    save: vi.fn(),
    ...overrides.userRepository,
  };
  const passwordHasher: PasswordHasher = {
    hash: vi.fn(),
    compare: vi.fn().mockResolvedValue(true),
    ...overrides.passwordHasher,
  };
  const tokenService: TokenService = {
    generateTokenPair: vi.fn().mockReturnValue({ accessToken: "access", refreshToken: "refresh" }),
    verifyRefreshToken: vi.fn(),
    ...overrides.tokenService,
  };
  return { userRepository, passwordHasher, tokenService };
}

describe("LoginUserUseCase", () => {
  it("logs in a user with valid credentials", async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps();
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    const result = await useCase.execute({ email: "user@example.com", password: "secret123" });

    expect(result.tokens).toEqual({ accessToken: "access", refreshToken: "refresh" });
    expect(result.user.email).toBe("user@example.com");
  });

  it("throws UnauthorizedError when the user does not exist", async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps({
      userRepository: { findByEmail: vi.fn().mockResolvedValue(null) },
    });
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    await expect(useCase.execute({ email: "unknown@example.com", password: "x" })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when the password is invalid", async () => {
    const { userRepository, passwordHasher, tokenService } = buildDeps({
      passwordHasher: { compare: vi.fn().mockResolvedValue(false) },
    });
    const useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

    await expect(useCase.execute({ email: "user@example.com", password: "wrong" })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("does not leak whether the email or the password was wrong", async () => {
    const deps1 = buildDeps({ userRepository: { findByEmail: vi.fn().mockResolvedValue(null) } });
    const deps2 = buildDeps({ passwordHasher: { compare: vi.fn().mockResolvedValue(false) } });

    const error1 = await new LoginUserUseCase(deps1.userRepository, deps1.passwordHasher, deps1.tokenService)
      .execute({ email: "a@example.com", password: "x" })
      .catch((error) => error);
    const error2 = await new LoginUserUseCase(deps2.userRepository, deps2.passwordHasher, deps2.tokenService)
      .execute({ email: "a@example.com", password: "x" })
      .catch((error) => error);

    expect(error1.message).toBe(error2.message);
  });
});
