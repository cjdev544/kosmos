import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./register-page";
import * as authContext from "./auth-context";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}));

vi.mock("./auth-context");

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the entered details and navigates home on success", async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
      register,
      logout: vi.fn(),
      user: null,
      authenticated: false,
    });
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText("Nombre"), "Test User");
    await user.type(screen.getByLabelText("Correo electrónico"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith("user@example.com", "secret123", "Test User"),
    );
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows an error message and does not navigate when registration fails", async () => {
    const register = vi.fn().mockRejectedValue(new Error("Ya existe un usuario con este correo electrónico"));
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
      register,
      logout: vi.fn(),
      user: null,
      authenticated: false,
    });
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText("Nombre"), "Test User");
    await user.type(screen.getByLabelText("Correo electrónico"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Ya existe un usuario con este correo electrónico")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("requires the password field to have at least 8 characters", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      authenticated: false,
    });
    renderRegisterPage();

    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("minLength", "8");
  });
});
