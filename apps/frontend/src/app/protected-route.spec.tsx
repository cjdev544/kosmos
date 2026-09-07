import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import * as authContext from "../features/auth/auth-context";

vi.mock("../features/auth/auth-context");

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/spaces" element={<div>Contenido protegido</div>} />
        </Route>
        <Route path="/login" element={<div>Página de login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("renders the nested route when the user is authenticated", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      authenticated: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderAt("/spaces");

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("redirects to /login when the user is not authenticated", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      authenticated: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderAt("/spaces");

    expect(screen.getByText("Página de login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });
});
