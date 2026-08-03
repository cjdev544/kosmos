import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import { env } from "../../../../shared/infrastructure/config/env.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type { TokenPair, TokenService } from "../../domain/ports.js";

@injectable()
export class JwtTokenService implements TokenService {
  generateTokenPair(userId: string): TokenPair {
    const accessToken = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
    const refreshToken = jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw new UnauthorizedError("Token de refresco inválido o expirado");
    }
  }
}
