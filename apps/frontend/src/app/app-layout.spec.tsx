import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app-layout";
import * as authContext from "../features/auth/auth-context";
import * as themeContext from "../features/theme/theme-context";

vi.mock("../features/auth/auth-context");
vi.mock("../features/theme/theme-context");
vi.mock("../features/notifications/notification-toggle", () => ({
  NotificationToggle: () => <div data-testid="notification-toggle" />,
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<div>Contenido de la página</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout", () => {
  it("renders the navigation links and the nested route content", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      authenticated: true,
      user: { id: "user-1", email: "user@example.com", name: "Test User", createdAt: "2026-01-01" },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(themeContext.useTheme).mockReturnValue({ theme: "dark", toggleTheme: vi.fn() });

    renderLayout();

    expect(screen.getByRole("link", { name: "Almanaque" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Tablero" })).toHaveAttribute("href", "/tablero");
    expect(screen.getByRole("link", { name: "Espacios" })).toHaveAttribute("href", "/spaces");
    expect(screen.getByRole("link", { name: "Todas las tareas" })).toHaveAttribute("href", "/tasks");
    expect(screen.getByText("Contenido de la página")).toBeInTheDocument();
  });

  it("shows the authenticated user's name", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      authenticated: true,
      user: { id: "user-1", email: "user@example.com", name: "Ada Lovelace", createdAt: "2026-01-01" },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(themeContext.useTheme).mockReturnValue({ theme: "dark", toggleTheme: vi.fn() });

    renderLayout();

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("calls logout when the exit button is clicked", async () => {
    const logout = vi.fn();
    vi.mocked(authContext.useAuth).mockReturnValue({
      authenticated: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout,
    });
    vi.mocked(themeContext.useTheme).mockReturnValue({ theme: "dark", toggleTheme: vi.fn() });
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByRole("button", { name: "Salir" }));

    expect(logout).toHaveBeenCalled();
  });

  it("calls toggleTheme and shows the icon matching the current theme", async () => {
    const toggleTheme = vi.fn();
    vi.mocked(authContext.useAuth).mockReturnValue({
      authenticated: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(themeContext.useTheme).mockReturnValue({ theme: "dark", toggleTheme });
    const user = userEvent.setup();
    renderLayout();

    const button = screen.getByRole("button", { name: "Cambiar a tema claro" });
    await user.click(button);

    expect(toggleTheme).toHaveBeenCalled();
  });
});
