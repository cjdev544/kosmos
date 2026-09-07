import { describe, expect, it } from "vitest";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors.js";

describe("domain errors", () => {
  it.each([
    [NotFoundError, "NOT_FOUND", 404],
    [UnauthorizedError, "UNAUTHORIZED", 401],
    [ForbiddenError, "FORBIDDEN", 403],
    [ConflictError, "CONFLICT", 409],
  ] as const)("%s has code %s and statusCode %i", (ErrorClass, code, statusCode) => {
    const error = new ErrorClass("boom");

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(code);
    expect(error.statusCode).toBe(statusCode);
    expect(error.message).toBe("boom");
  });

  it("ValidationError carries optional details", () => {
    const error = new ValidationError("invalid", { field: "email" });

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: "email" });
  });

  it("ValidationError works without details", () => {
    const error = new ValidationError("invalid");

    expect(error.details).toBeUndefined();
  });
});
