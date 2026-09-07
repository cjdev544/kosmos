import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSpaceTemplates } from "./use-space-templates";
import * as spacesApi from "./api";

vi.mock("./api");

describe("useSpaceTemplates", () => {
  it("loads templates on mount", async () => {
    vi.mocked(spacesApi.listTemplates).mockResolvedValue([{ id: "student", label: "Estudiantes" }]);

    const { result } = renderHook(() => useSpaceTemplates());

    expect(result.current).toEqual([]);
    await waitFor(() => expect(result.current).toEqual([{ id: "student", label: "Estudiantes" }]));
  });

  it("falls back to an empty list when loading fails", async () => {
    vi.mocked(spacesApi.listTemplates).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useSpaceTemplates());

    await waitFor(() => expect(spacesApi.listTemplates).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });
});
