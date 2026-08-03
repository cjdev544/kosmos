import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../../domain/errors.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Falta el encabezado de autorización o tiene un formato inválido");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    throw new UnauthorizedError("Token inválido o expirado");
  }
}
