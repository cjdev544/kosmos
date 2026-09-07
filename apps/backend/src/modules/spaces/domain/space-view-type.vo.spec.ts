import { describe, expect, it } from "vitest";
import { assertSpaceViewType } from "./space-view-type.vo.js";
import { ValidationError } from "../../../shared/domain/errors.js";

describe("assertSpaceViewType", () => {
  it.each(["LIST", "CALENDAR", "KANBAN"])("accepts %s as a valid view type", (value) => {
    expect(assertSpaceViewType(value)).toBe(value);
  });

  it("throws ValidationError for an unknown view type", () => {
    expect(() => assertSpaceViewType("GRID")).toThrow(ValidationError);
  });

  it("is case-sensitive", () => {
    expect(() => assertSpaceViewType("list")).toThrow(ValidationError);
  });
});
