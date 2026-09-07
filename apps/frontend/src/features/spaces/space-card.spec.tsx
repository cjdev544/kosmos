import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SpaceCard } from "./space-card";
import type { Space } from "./types";

function buildSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: "space-1",
    name: "Trabajo",
    icon: "💼",
    color: "#6366f1",
    viewType: "LIST",
    isActive: true,
    position: 0,
    ownerId: "user-1",
    ...overrides,
  };
}

function renderCard(props: Partial<Parameters<typeof SpaceCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <SpaceCard
        space={buildSpace()}
        taskCount={0}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onColorChange={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SpaceCard", () => {
  it("shows the space name and view type", () => {
    renderCard({ space: buildSpace({ name: "Trabajo", viewType: "KANBAN" }) });

    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.getByText("Tablero")).toBeInTheDocument();
  });

  it("links to the space detail page", () => {
    renderCard({ space: buildSpace({ id: "space-42" }) });

    expect(screen.getByRole("link")).toHaveAttribute("href", "/spaces/space-42");
  });

  it("calls onToggle with the space id when the status button is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    renderCard({ space: buildSpace({ id: "space-1", isActive: true }), onToggle });

    await user.click(screen.getByRole("button", { name: "Activo" }));

    expect(onToggle).toHaveBeenCalledWith("space-1");
  });

  it("shows Inactivo for a disabled space", () => {
    renderCard({ space: buildSpace({ isActive: false }) });

    expect(screen.getByRole("button", { name: "Inactivo" })).toBeInTheDocument();
  });

  it("deletes without a task-count warning when the space has no tasks", async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderCard({ space: buildSpace({ id: "space-1", name: "Trabajo" }), taskCount: 0, onDelete });

    await user.click(screen.getByRole("button", { name: "Eliminar Trabajo" }));

    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar el espacio "Trabajo"?');
    expect(onDelete).toHaveBeenCalledWith("space-1");
  });

  it("warns about existing tasks before deleting", async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderCard({ space: buildSpace({ id: "space-1" }), taskCount: 3, onDelete });

    await user.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(window.confirm).toHaveBeenCalledWith(
      'Este espacio tiene 3 tarea(s). Si lo eliminas, también se eliminarán. ¿Eliminar de todas formas?',
    );
    expect(onDelete).toHaveBeenCalledWith("space-1");
  });

  it("does not delete when the confirmation is dismissed", async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    renderCard({ onDelete });

    await user.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
