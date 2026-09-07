import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSpaceFilter } from "./use-space-filter";
import type { Space } from "./types";

function buildSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: "space-1",
    name: "Trabajo",
    icon: null,
    color: null,
    viewType: "LIST",
    isActive: true,
    position: 0,
    ownerId: "user-1",
    ...overrides,
  };
}

describe("useSpaceFilter", () => {
  it("starts with every space visible", () => {
    const spaces = [buildSpace({ id: "s1" }), buildSpace({ id: "s2" })];

    const { result } = renderHook(() => useSpaceFilter(spaces));

    expect(result.current.visibleSpaceIds).toEqual(new Set(["s1", "s2"]));
    expect(result.current.visibleSpaces.map((s) => s.id)).toEqual(["s1", "s2"]);
  });

  it("toggleSpace hides a visible space", () => {
    const spaces = [buildSpace({ id: "s1" }), buildSpace({ id: "s2" })];
    const { result } = renderHook(() => useSpaceFilter(spaces));

    act(() => result.current.toggleSpace("s1"));

    expect(result.current.visibleSpaceIds.has("s1")).toBe(false);
    expect(result.current.visibleSpaces.map((s) => s.id)).toEqual(["s2"]);
  });

  it("toggleSpace shows a hidden space again", () => {
    const spaces = [buildSpace({ id: "s1" }), buildSpace({ id: "s2" })];
    const { result } = renderHook(() => useSpaceFilter(spaces));

    act(() => result.current.toggleSpace("s1"));
    act(() => result.current.toggleSpace("s1"));

    expect(result.current.visibleSpaceIds.has("s1")).toBe(true);
  });

  it("does not reset an explicit selection when the spaces array is replaced with new instances", () => {
    const spaces = [buildSpace({ id: "s1" }), buildSpace({ id: "s2" })];
    const { result, rerender } = renderHook(({ spaces }) => useSpaceFilter(spaces), {
      initialProps: { spaces },
    });

    act(() => result.current.toggleSpace("s1"));
    rerender({ spaces: [buildSpace({ id: "s1" }), buildSpace({ id: "s2" })] });

    expect(result.current.visibleSpaceIds.has("s1")).toBe(false);
  });

  it("populates visibility once new spaces arrive after starting empty", () => {
    const { result, rerender } = renderHook(({ spaces }) => useSpaceFilter(spaces), {
      initialProps: { spaces: [] as Space[] },
    });

    expect(result.current.visibleSpaceIds.size).toBe(0);

    rerender({ spaces: [buildSpace({ id: "s1" })] });

    expect(result.current.visibleSpaceIds).toEqual(new Set(["s1"]));
  });
});
