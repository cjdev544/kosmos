import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TableroPage } from "./tablero-page";
import * as useSpacesModule from "../spaces/use-spaces";
import * as useMyTasksModule from "./use-my-tasks";
import type { Space } from "../spaces/types";
import type { Task } from "./types";

vi.mock("../spaces/use-spaces");
vi.mock("./use-my-tasks");

function buildSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: "space-1",
    name: "Trabajo",
    icon: "💼",
    color: null,
    viewType: "KANBAN",
    isActive: true,
    position: 0,
    ownerId: "user-1",
    ...overrides,
  };
}

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Comprar leche",
    description: null,
    subtasks: [],
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    position: 0,
    spaceId: "space-1",
    ...overrides,
  };
}

function mockSpaces(overrides: Partial<ReturnType<typeof useSpacesModule.useSpaces>> = {}) {
  vi.mocked(useSpacesModule.useSpaces).mockReturnValue({
    spaces: [buildSpace()],
    loading: false,
    error: null,
    createSpace: vi.fn(),
    toggleSpace: vi.fn(),
    changeSpaceView: vi.fn(),
    changeSpaceColor: vi.fn(),
    applyTemplate: vi.fn(),
    deleteSpace: vi.fn(),
    ...overrides,
  });
}

function mockMyTasks(overrides: Partial<ReturnType<typeof useMyTasksModule.useMyTasks>> = {}) {
  vi.mocked(useMyTasksModule.useMyTasks).mockReturnValue({
    tasks: [buildTask()],
    loading: false,
    error: null,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    updateStatus: vi.fn(),
    addSubtask: vi.fn(),
    toggleSubtask: vi.fn(),
    deleteSubtask: vi.fn(),
    deleteTask: vi.fn(),
    ...overrides,
  });
}

describe("TableroPage", () => {
  beforeEach(() => {
    mockSpaces();
    mockMyTasks();
  });

  it("shows a loading placeholder while loading", () => {
    mockMyTasks({ loading: true });

    render(<TableroPage />);

    expect(screen.getByText("Cargando tableros...")).toBeInTheDocument();
  });

  it("shows the error message instead of the picker when loading fails", () => {
    mockMyTasks({ error: "Error cargando tareas" });

    render(<TableroPage />);

    expect(screen.getByText("Error cargando tareas")).toBeInTheDocument();
  });

  it("shows an empty message when no space has tasks", () => {
    mockSpaces({ spaces: [buildSpace()] });
    mockMyTasks({ tasks: [] });

    render(<TableroPage />);

    expect(screen.getByText("Ningún espacio tiene tareas todavía.")).toBeInTheDocument();
  });

  it("lists only spaces that have at least one task, with status counts", () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" }), buildSpace({ id: "space-2", name: "Casa" })] });
    mockMyTasks({
      tasks: [
        buildTask({ id: "t1", spaceId: "space-1", status: "TODO" }),
        buildTask({ id: "t2", spaceId: "space-1", status: "DONE" }),
      ],
    });

    render(<TableroPage />);

    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.queryByText("Casa")).not.toBeInTheDocument();
  });

  it("opens a space's board when its card is clicked, and returns to the picker via the back link", async () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({ tasks: [buildTask({ id: "t1", spaceId: "space-1", title: "Comprar leche" })] });
    const user = userEvent.setup();
    render(<TableroPage />);

    await user.click(screen.getByText("Trabajo"));

    expect(screen.getByRole("heading", { name: /Trabajo/ })).toBeInTheDocument();
    expect(screen.getByText("Comprar leche")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "← Tablero" }));

    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.queryByText("Comprar leche")).not.toBeInTheDocument();
  });

  it("opens the task detail modal when a task card is clicked inside the board", async () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({ tasks: [buildTask({ id: "t1", spaceId: "space-1", title: "Comprar leche" })] });
    const user = userEvent.setup();
    render(<TableroPage />);

    await user.click(screen.getByText("Trabajo"));
    await user.click(screen.getByText("Comprar leche"));

    expect(screen.getByLabelText("Título de la tarea")).toHaveValue("Comprar leche");
  });
});
