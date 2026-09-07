import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationToggle } from "./notification-toggle";
import * as usePushNotificationsModule from "./use-push-notifications";

vi.mock("./use-push-notifications");

function mockPushState(overrides: Partial<ReturnType<typeof usePushNotificationsModule.usePushNotifications>>) {
  vi.mocked(usePushNotificationsModule.usePushNotifications).mockReturnValue({
    status: "ready",
    subscribed: false,
    loading: false,
    error: null,
    enable: vi.fn(),
    disable: vi.fn(),
    ...overrides,
  });
}

describe("NotificationToggle", () => {
  it("renders nothing when push is unsupported", () => {
    mockPushState({ status: "unsupported" });

    const { container } = render(<NotificationToggle />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows an install hint on iOS outside of an installed PWA", () => {
    mockPushState({ status: "needs-install" });

    render(<NotificationToggle />);

    expect(screen.getByText(/Instala la app para notificaciones/)).toBeInTheDocument();
  });

  it("calls enable when not subscribed and the button is clicked", async () => {
    const enable = vi.fn();
    mockPushState({ subscribed: false, enable });
    const user = userEvent.setup();
    render(<NotificationToggle />);

    await user.click(screen.getByRole("button", { name: "🔕 Activar notificaciones" }));

    expect(enable).toHaveBeenCalled();
  });

  it("calls disable when already subscribed and the button is clicked", async () => {
    const disable = vi.fn();
    mockPushState({ subscribed: true, disable });
    const user = userEvent.setup();
    render(<NotificationToggle />);

    await user.click(screen.getByRole("button", { name: "🔔 Notificaciones activadas" }));

    expect(disable).toHaveBeenCalled();
  });

  it("disables the button while loading", () => {
    mockPushState({ loading: true });

    render(<NotificationToggle />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows the error message when present", () => {
    mockPushState({ error: "No se pudo activar las notificaciones" });

    render(<NotificationToggle />);

    expect(screen.getByText("No se pudo activar las notificaciones")).toBeInTheDocument();
  });
});
