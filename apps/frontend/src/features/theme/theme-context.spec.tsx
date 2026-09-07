import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "./theme-context";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("ThemeProvider / useTheme", () => {
  it("defaults to dark theme when nothing is stored", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("");
  });

  it("restores a previously stored theme", () => {
    localStorage.setItem("kosmos-theme", "light");

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggleTheme flips between dark and light and persists the choice", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem("kosmos-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem("kosmos-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("");
  });

  it("useTheme outside of a provider falls back to the default dark theme", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
  });
});
