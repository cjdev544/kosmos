import { describe, expect, it } from "vitest";
import { findSpaceTemplate, SPACE_TEMPLATES } from "./space-templates.js";

describe("findSpaceTemplate", () => {
  it("finds an existing template by id", () => {
    const template = findSpaceTemplate("student");

    expect(template).toBeDefined();
    expect(template?.id).toBe("student");
  });

  it("returns undefined for an unknown template id", () => {
    expect(findSpaceTemplate("does-not-exist")).toBeUndefined();
  });

  it("every declared template has at least one space definition", () => {
    for (const template of SPACE_TEMPLATES) {
      expect(template.spaces.length).toBeGreaterThan(0);
    }
  });

  it("template ids are unique", () => {
    const ids = SPACE_TEMPLATES.map((template) => template.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
