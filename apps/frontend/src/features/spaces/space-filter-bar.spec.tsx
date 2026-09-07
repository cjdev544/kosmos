import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpaceFilterBar } from "./space-filter-bar";
import type { Space } from "./types";

function buildSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: "space-1",
    name: "Trabajo",
    icon: "💼",
    color: null,
    viewType: "LIST",
    isActive: true,
    position: 0,
    ownerId: "user-1",
    ...overrides,
  };
}

describe("SpaceFilterBar", () => {
  it("renders one checkbox per space, checked when visible", () => {
    const spaces = [buildSpace({ id: "s1", name: "Trabajo" }), buildSpace({ id: "s2", name: "Personal" })];

    render(<SpaceFilterBar spaces={spaces} visibleSpaceIds={new Set(["s1"])} onToggle={vi.fn()} />);

    expect(screen.getByRole("checkbox", { name: /Trabajo/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Personal/ })).not.toBeChecked();
  });

  it("calls onToggle with the space id when a checkbox is clicked", async () => {
    const onToggle = vi.fn();
    const spaces = [buildSpace({ id: "s1", name: "Trabajo" })];
    const user = userEvent.setup();
    render(<SpaceFilterBar spaces={spaces} visibleSpaceIds={new Set()} onToggle={onToggle} />);

    await user.click(screen.getByRole("checkbox", { name: /Trabajo/ }));

    expect(onToggle).toHaveBeenCalledWith("s1");
  });
});
