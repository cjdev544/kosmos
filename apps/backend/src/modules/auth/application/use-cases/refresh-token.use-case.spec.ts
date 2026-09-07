import { describe, expect, it, vi } from "vitest";
import { RefreshTokenUseCase } from "./refresh-token.use-case.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type { TokenService, UserRepository } from "../../domain/ports.js";
import { buildUser } from "../../../../../test/factories.js";

function buildDeps(overrides: {
  userRepository?: Partial<UserRepository>;
  tokenService?: Partial<TokenService>;
} = {}) {
  const userRepository: UserRepository = {
    findById: vi.fn().mockResolvedValue(buildUser()),
    findByEmail: vi.fn(),
    save: vi.fn(),
    ...overrides.userRepository,
  };
  const tokenService: TokenService = {
    generateTokenPair: vi.fn().mockReturnValue({ accessToken: "new-access", refreshToken: "new-refresh" }),
    verifyRefreshToken: vi.fn().mockReturnValue({ sub: "user-1" }),
    ...overrides.tokenService,
  };
  return { userRepository, tokenService };
}

describe("RefreshTokenUseCase", () => {
  it("issues a new token pair for a valid refresh token", async () => {
    const { userRepository, tokenService } = buildDeps();
    const useCase = new RefreshTokenUseCase(userRepository, tokenService);

    const result = await useCase.execute({ refreshToken: "valid-refresh-token" });

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
    expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    expect(result.tokens).toEqual({ accessToken: "new-access", refreshToken: "new-refresh" });
  });

  it("propagates the error when the refresh token is invalid", async () => {
    const { userRepository, tokenService } = buildDeps({
      tokenService: {
        verifyRefreshToken: vi.fn().mockImplementation(() => {
          throw new UnauthorizedError("Token de refresco inválido o expirado");
        }),
      },
    });
    const useCase = new RefreshTokenUseCase(userRepository, tokenService);

    await expect(useCase.execute({ refreshToken: "bad-token" })).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when the user no longer exists", async () => {
    const { userRepository, tokenService } = buildDeps({
      userRepository: { findById: vi.fn().mockResolvedValue(null) },
    });
    const useCase = new RefreshTokenUseCase(userRepository, tokenService);

    await expect(useCase.execute({ refreshToken: "valid-refresh-token" })).rejects.toThrow(UnauthorizedError);
  });
});
