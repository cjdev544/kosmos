import { describe, expect, it } from "vitest";
import { assertTaskStatus } from "./task-status.vo.js";
import { ValidationError } from "../../../shared/domain/errors.js";

describe("assertTaskStatus", () => {
  it.each(["TODO", "IN_PROGRESS", "DONE"])("accepts %s as a valid status", (value) => {
    expect(assertTaskStatus(value)).toBe(value);
  });

  it("throws ValidationError for an unknown status", () => {
    expect(() => assertTaskStatus("ARCHIVED")).toThrow(ValidationError);
  });

  it("is case-sensitive", () => {
    expect(() => assertTaskStatus("todo")).toThrow(ValidationError);
  });
});
