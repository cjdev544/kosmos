import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSpaces } from "./use-spaces";
import * as spacesApi from "./api";
import type { Space } from "./types";

vi.mock("./api");

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

describe("useSpaces", () => {
  beforeEach(() => {
    vi.mocked(spacesApi.listSpaces).mockResolvedValue([]);
  });

  it("loads spaces on mount", async () => {
    vi.mocked(spacesApi.listSpaces).mockResolvedValue([buildSpace()]);

    const { result } = renderHook(() => useSpaces());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.spaces).toEqual([buildSpace()]);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error message when loading fails", async () => {
    vi.mocked(spacesApi.listSpaces).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useSpaces());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("network down");
    expect(result.current.spaces).toEqual([]);
  });

  it("createSpace appends the newly created space", async () => {
    const { result } = renderHook(() => useSpaces());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const created = buildSpace({ id: "space-2", name: "Nuevo" });
    vi.mocked(spacesApi.createSpace).mockResolvedValue(created);

    await act(() => result.current.createSpace({ name: "Nuevo" }));

    expect(result.current.spaces).toEqual([created]);
  });

  it("toggleSpace replaces the matching space with the server response", async () => {
    const original = buildSpace({ id: "space-1", isActive: true });
    vi.mocked(spacesApi.listSpaces).mockResolvedValue([original]);
    const { result } = renderHook(() => useSpaces());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const toggled = { ...original, isActive: false };
    vi.mocked(spacesApi.toggleSpace).mockResolvedValue(toggled);

    await act(() => result.current.toggleSpace("space-1"));

    expect(result.current.spaces).toEqual([toggled]);
  });

  it("deleteSpace removes the space from local state", async () => {
    vi.mocked(spacesApi.listSpaces).mockResolvedValue([buildSpace({ id: "space-1" })]);
    const { result } = renderHook(() => useSpaces());
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(spacesApi.deleteSpace).mockResolvedValue(undefined);

    await act(() => result.current.deleteSpace("space-1"));

    expect(result.current.spaces).toEqual([]);
  });

  it("applyTemplate appends every space the template creates", async () => {
    const { result } = renderHook(() => useSpaces());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const created = [buildSpace({ id: "s1" }), buildSpace({ id: "s2" })];
    vi.mocked(spacesApi.applyTemplate).mockResolvedValue(created);

    await act(() => result.current.applyTemplate("student"));

    expect(result.current.spaces).toEqual(created);
  });
});
