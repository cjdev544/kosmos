import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { errorHandler, notFoundHandler } from "./error-handler.middleware.js";
import { NotFoundError, ValidationError } from "../../domain/errors.js";
import type { Request, Response } from "express";

function buildResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  it("maps a DomainError to its status code and code", () => {
    const res = buildResponse();

    errorHandler(new NotFoundError("Espacio no encontrado"), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "NOT_FOUND", message: "Espacio no encontrado" },
    });
  });

  it("maps a ValidationError thrown directly by domain code (details are not surfaced)", () => {
    // ValidationError is handled by the generic `DomainError` branch, which only reads
    // `code`/`message` — unlike the ZodError branch below, it does not forward `details`.
    const res = buildResponse();

    errorHandler(new ValidationError("Datos inválidos", { field: "email" }), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "VALIDATION_ERROR", message: "Datos inválidos" },
    });
  });

  it("maps a ZodError to a 400 validation error", () => {
    const res = buildResponse();
    const schema = z.object({ email: z.string() });
    const zodError = schema.safeParse({}).error as ZodError;

    errorHandler(zodError, {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: "VALIDATION_ERROR" }) }),
    );
  });

  it("maps an unrecognized entity.too.large error to 413", () => {
    const res = buildResponse();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler({ type: "entity.too.large" }, {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(413);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("falls back to 500 for unknown errors", () => {
    const res = buildResponse();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("unexpected"), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Ocurrió un error inesperado" },
    });
    consoleSpy.mockRestore();
  });
});

describe("notFoundHandler", () => {
  it("returns a 404 describing the missing route", () => {
    const res = buildResponse();
    const req = { method: "GET", path: "/does-not-exist" } as Request;

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: "NOT_FOUND", message: "La ruta GET /does-not-exist no existe" },
    });
  });
});
