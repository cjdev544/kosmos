import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { DomainError, ValidationError } from "../../domain/errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (typeof err === "object" && err !== null && (err as Record<string, unknown>).type === "entity.too.large") {
    res.status(413).json({ error: { code: "PAYLOAD_TOO_LARGE", message: "El cuerpo de la solicitud supera el límite permitido" } });
    return;
  }

  if (err instanceof ZodError) {
    const validationError = new ValidationError("Datos de la solicitud inválidos", err.flatten());
    res.status(validationError.statusCode).json({
      error: { code: validationError.code, message: validationError.message, details: validationError.details },
    });
    return;
  }

  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error inesperado" },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `La ruta ${req.method} ${req.path} no existe` },
  });
}
