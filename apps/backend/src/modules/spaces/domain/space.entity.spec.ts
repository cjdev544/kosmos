import { describe, expect, it } from "vitest";
import { Space, SpaceProps } from "./space.entity.js";
import { ValidationError } from "../../../shared/domain/errors.js";

const validProps: SpaceProps = {
  id: "space-1",
  name: "Trabajo",
  icon: null,
  color: null,
  viewType: "LIST",
  isActive: true,
  position: 0,
  ownerId: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

function buildSpace(overrides: Partial<SpaceProps> = {}): Space {
  return Space.create({ ...validProps, ...overrides });
}

describe("Space", () => {
  it("creates a space with valid props", () => {
    const space = buildSpace();

    expect(space.id).toBe("space-1");
    expect(space.ownerId).toBe("user-1");
    expect(space.viewType).toBe("LIST");
    expect(space.isActive).toBe(true);
  });

  it("throws ValidationError when name is empty", () => {
    expect(() => buildSpace({ name: "" })).toThrow(ValidationError);
  });

  it("throws ValidationError when name is only whitespace", () => {
    expect(() => buildSpace({ name: "   " })).toThrow(ValidationError);
  });

  it("toggles isActive and bumps updatedAt", () => {
    const space = buildSpace();
    const before = space.toSnapshot().updatedAt;

    space.toggleActive();

    expect(space.isActive).toBe(false);
    expect(space.toSnapshot().updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("toggling twice returns to the original state", () => {
    const space = buildSpace();

    space.toggleActive();
    space.toggleActive();

    expect(space.isActive).toBe(true);
  });

  it("changes the view type", () => {
    const space = buildSpace();

    space.changeViewType("KANBAN");

    expect(space.viewType).toBe("KANBAN");
  });

  it("changes the color, including to null", () => {
    const space = buildSpace({ color: "#FF0000" });

    space.changeColor(null);

    expect(space.toSnapshot().color).toBeNull();
  });

  it("toSnapshot returns an independent copy of the props", () => {
    const space = buildSpace();
    const snapshot = space.toSnapshot();

    space.changeColor("#000000");

    expect(snapshot.color).toBeNull();
  });
});
