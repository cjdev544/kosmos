import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SpacesPage } from "./spaces-page";
import * as useSpacesModule from "./use-spaces";
import * as useMyTasksModule from "../tasks/use-my-tasks";
import * as useSpaceTemplatesModule from "./use-space-templates";
import type { Space } from "./types";
import type { Task } from "../tasks/types";

vi.mock("./use-spaces");
vi.mock("../tasks/use-my-tasks");
vi.mock("./use-space-templates");

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
    spaces: [],
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

function renderPage() {
  return render(
    <MemoryRouter>
      <SpacesPage />
    </MemoryRouter>,
  );
}

describe("SpacesPage", () => {
  beforeEach(() => {
    vi.mocked(useSpaceTemplatesModule.useSpaceTemplates).mockReturnValue([]);
  });

  it("shows a loading indicator while spaces are loading", () => {
    mockSpaces({ loading: true });
    mockMyTasks();

    renderPage();

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("shows the error message when loading spaces fails", () => {
    mockSpaces({ error: "Error cargando espacios" });
    mockMyTasks();

    renderPage();

    expect(screen.getByText("Error cargando espacios")).toBeInTheDocument();
  });

  it("renders a card per space with the task count scoped to that space", () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" }), buildSpace({ id: "space-2", name: "Casa" })] });
    mockMyTasks({
      tasks: [
        buildTask({ id: "t1", spaceId: "space-1" }),
        buildTask({ id: "t2", spaceId: "space-1" }),
        buildTask({ id: "t3", spaceId: "space-2" }),
      ],
    });

    renderPage();

    expect(screen.getByText("Trabajo")).toBeInTheDocument();
    expect(screen.getByText("Casa")).toBeInTheDocument();
  });

  it("renders the create-space trigger", () => {
    mockSpaces();
    mockMyTasks();

    renderPage();

    expect(screen.getByRole("button", { name: "+ Nuevo espacio" })).toBeInTheDocument();
  });
});
