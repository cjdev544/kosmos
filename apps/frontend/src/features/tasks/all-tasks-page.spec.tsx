import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllTasksPage } from "./all-tasks-page";
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
    viewType: "LIST",
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
    tasks: [],
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

describe("AllTasksPage", () => {
  beforeEach(() => {
    mockSpaces();
    mockMyTasks();
  });

  it("shows a loading indicator and error message when present", () => {
    mockMyTasks({ loading: true, error: "Error cargando tareas" });

    render(<AllTasksPage />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.getByText("Error cargando tareas")).toBeInTheDocument();
  });

  it("groups tasks under their space heading", () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({ tasks: [buildTask({ title: "Comprar leche", spaceId: "space-1" })] });

    render(<AllTasksPage />);

    expect(screen.getByRole("heading", { name: /Trabajo/ })).toBeInTheDocument();
    expect(screen.getByText(/Comprar leche/)).toBeInTheDocument();
  });

  it("shows an empty message for a space with no tasks", () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({ tasks: [] });

    render(<AllTasksPage />);

    expect(screen.getByText("Sin tareas.")).toBeInTheDocument();
  });

  it("hides a space's tasks when it is unchecked in the filter bar", async () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({ tasks: [buildTask({ title: "Comprar leche", spaceId: "space-1" })] });
    const user = userEvent.setup();
    render(<AllTasksPage />);

    await user.click(screen.getByRole("checkbox", { name: /Trabajo/ }));

    expect(screen.getByText("Marca al menos un espacio para ver sus tareas.")).toBeInTheDocument();
    expect(screen.queryByText(/Comprar leche/)).not.toBeInTheDocument();
  });

  it("filters tasks by priority across all spaces", async () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({
      tasks: [
        buildTask({ id: "t1", title: "Tarea alta", priority: "HIGH", spaceId: "space-1" }),
        buildTask({ id: "t2", title: "Tarea baja", priority: "LOW", spaceId: "space-1" }),
      ],
    });
    const user = userEvent.setup();
    render(<AllTasksPage />);

    await user.click(screen.getByRole("button", { name: "Alta" }));

    expect(screen.getByText(/Tarea alta/)).toBeInTheDocument();
    expect(screen.queryByText(/Tarea baja/)).not.toBeInTheDocument();
  });

  it("opens the task detail modal when a task is clicked", async () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1" })] });
    mockMyTasks({ tasks: [buildTask({ title: "Comprar leche", spaceId: "space-1" })] });
    const user = userEvent.setup();
    render(<AllTasksPage />);

    await user.click(screen.getByText(/Comprar leche/));

    expect(screen.getByLabelText("Título de la tarea")).toHaveValue("Comprar leche");
  });
});
