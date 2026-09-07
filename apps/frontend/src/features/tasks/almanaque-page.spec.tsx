import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlmanaquePage } from "./almanaque-page";
import * as useSpacesModule from "../spaces/use-spaces";
import * as useMyTasksModule from "./use-my-tasks";
import type { Space } from "../spaces/types";
import type { Task } from "./types";

vi.mock("../spaces/use-spaces");
vi.mock("./use-my-tasks");
vi.mock("./views/calendar-view", () => ({
  CalendarView: (props: { tasks: Task[]; hiddenTasks: Task[] }) => (
    <div data-testid="calendar-view-mock">
      <span data-testid="visible-count">{props.tasks.length}</span>
      <span data-testid="hidden-count">{props.hiddenTasks.length}</span>
    </div>
  ),
}));

function buildSpace(overrides: Partial<Space> = {}): Space {
  return {
    id: "space-1",
    name: "Trabajo",
    icon: "💼",
    color: null,
    viewType: "CALENDAR",
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
    dueDate: "2026-03-15",
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

describe("AlmanaquePage", () => {
  beforeEach(() => {
    mockSpaces();
    mockMyTasks();
  });

  it("shows a loading indicator and error message when present", () => {
    mockMyTasks({ loading: true, error: "Error cargando tareas" });

    render(<AlmanaquePage />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.getByText("Error cargando tareas")).toBeInTheDocument();
  });

  it("passes only the tasks from visible spaces to the calendar as visible", () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1" })] });
    mockMyTasks({
      tasks: [buildTask({ id: "t1", spaceId: "space-1" }), buildTask({ id: "t2", spaceId: "space-1" })],
    });

    render(<AlmanaquePage />);

    expect(screen.getByTestId("visible-count")).toHaveTextContent("2");
    expect(screen.getByTestId("hidden-count")).toHaveTextContent("0");
  });

  it("moves a space's tasks to hidden once it is unchecked", async () => {
    mockSpaces({ spaces: [buildSpace({ id: "space-1", name: "Trabajo" })] });
    mockMyTasks({ tasks: [buildTask({ id: "t1", spaceId: "space-1" })] });
    const user = userEvent.setup();
    render(<AlmanaquePage />);

    await user.click(screen.getByRole("checkbox", { name: /Trabajo/ }));

    expect(screen.getByTestId("visible-count")).toHaveTextContent("0");
    expect(screen.getByTestId("hidden-count")).toHaveTextContent("1");
  });
});
