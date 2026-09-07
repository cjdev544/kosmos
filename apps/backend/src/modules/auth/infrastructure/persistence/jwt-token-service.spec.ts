import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { JwtTokenService } from "./jwt-token-service.js";
import { env } from "../../../../shared/infrastructure/config/env.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";

describe("JwtTokenService", () => {
  it("generates an access and refresh token embedding the user id", () => {
    const service = new JwtTokenService();

    const { accessToken, refreshToken } = service.generateTokenPair("user-1");

    expect(jwt.decode(accessToken)).toMatchObject({ sub: "user-1" });
    expect(jwt.decode(refreshToken)).toMatchObject({ sub: "user-1" });
  });

  it("signs the access and refresh tokens with different secrets", () => {
    const service = new JwtTokenService();

    const { accessToken, refreshToken } = service.generateTokenPair("user-1");

    expect(() => jwt.verify(accessToken, env.JWT_REFRESH_SECRET)).toThrow();
    expect(() => jwt.verify(refreshToken, env.JWT_ACCESS_SECRET)).toThrow();
  });

  it("verifies a refresh token it issued", () => {
    const service = new JwtTokenService();
    const { refreshToken } = service.generateTokenPair("user-1");

    expect(service.verifyRefreshToken(refreshToken)).toMatchObject({ sub: "user-1" });
  });

  it("throws UnauthorizedError for a malformed refresh token", () => {
    const service = new JwtTokenService();

    expect(() => service.verifyRefreshToken("not-a-real-token")).toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError for an expired refresh token", () => {
    const service = new JwtTokenService();
    const expiredToken = jwt.sign({ sub: "user-1" }, env.JWT_REFRESH_SECRET, { expiresIn: -10 });

    expect(() => service.verifyRefreshToken(expiredToken)).toThrow(UnauthorizedError);
  });
});
