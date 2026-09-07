import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./login-page";
import * as authContext from "./auth-context";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}));

vi.mock("./auth-context");

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the entered credentials and navigates home on success", async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authContext.useAuth).mockReturnValue({
      login,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      authenticated: false,
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Correo electrónico"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => expect(login).toHaveBeenCalledWith("user@example.com", "secret123"));
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows an error message and does not navigate when login fails", async () => {
    const login = vi.fn().mockRejectedValue(new Error("Credenciales inválidas"));
    vi.mocked(authContext.useAuth).mockReturnValue({
      login,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      authenticated: false,
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Correo electrónico"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveLogin!: () => void;
    const login = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      }),
    );
    vi.mocked(authContext.useAuth).mockReturnValue({
      login,
      register: vi.fn(),
      logout: vi.fn(),
      user: null,
      authenticated: false,
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Correo electrónico"), "user@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();

    resolveLogin();
    await waitFor(() => expect(navigateMock).toHaveBeenCalled());
  });
});
