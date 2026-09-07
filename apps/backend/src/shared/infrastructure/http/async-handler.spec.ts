import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "./async-handler.js";
import type { NextFunction, Request, Response } from "express";

describe("asyncHandler", () => {
  it("does not call next when the handler resolves", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const next = vi.fn() as NextFunction;

    wrapped({} as Request, {} as Response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a rejection to next", async () => {
    const error = new Error("boom");
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    const next = vi.fn() as NextFunction;

    wrapped({} as Request, {} as Response, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });
});
