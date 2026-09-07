import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SpaceDetailPage } from "./space-detail-page";
import * as useSpacesModule from "./use-spaces";
import * as useTasksModule from "../tasks/use-tasks";
import type { Space } from "./types";
import type { Task } from "../tasks/types";

vi.mock("./use-spaces");
vi.mock("../tasks/use-tasks");
vi.mock("../tasks/views/calendar-view", () => ({
  CalendarView: () => <div data-testid="calendar-view-mock" />,
}));

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

function mockUseTasksReturn(overrides: Partial<ReturnType<typeof useTasksModule.useTasks>> = {}) {
  vi.mocked(useTasksModule.useTasks).mockReturnValue({
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
    reorderTasks: vi.fn(),
    ...overrides,
  });
}

function mockUseSpacesReturn(overrides: Partial<ReturnType<typeof useSpacesModule.useSpaces>> = {}) {
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/spaces/space-1"]}>
      <Routes>
        <Route path="/spaces/:spaceId" element={<SpaceDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SpaceDetailPage", () => {
  beforeEach(() => {
    mockUseSpacesReturn();
    mockUseTasksReturn();
  });

  it("shows the space's icon and name once loaded", () => {
    mockUseSpacesReturn({ spaces: [buildSpace({ icon: "💼", name: "Trabajo" })] });

    renderPage();

    expect(screen.getByRole("heading", { name: "💼 Trabajo" })).toBeInTheDocument();
  });

  it("shows a loading placeholder when the space is not found yet", () => {
    mockUseSpacesReturn({ spaces: [] });

    renderPage();

    expect(screen.getByRole("heading", { name: /Cargando/ })).toBeInTheDocument();
  });

  it("renders the list view by default and lists its tasks", () => {
    mockUseSpacesReturn({ spaces: [buildSpace({ viewType: "LIST" })] });
    mockUseTasksReturn({ tasks: [buildTask({ title: "Comprar leche" })] });

    renderPage();

    expect(screen.getByText(/Comprar leche/)).toBeInTheDocument();
  });

  it("renders the kanban view with its fixed columns when viewType is KANBAN", () => {
    mockUseSpacesReturn({ spaces: [buildSpace({ viewType: "KANBAN" })] });

    renderPage();

    expect(screen.getByText(/Por hacer/)).toBeInTheDocument();
  });

  it("renders the calendar view when viewType is CALENDAR", () => {
    mockUseSpacesReturn({ spaces: [buildSpace({ viewType: "CALENDAR" })] });

    renderPage();

    expect(screen.getByTestId("calendar-view-mock")).toBeInTheDocument();
  });

  it("changes the view type when a view switch button is clicked", async () => {
    const changeSpaceView = vi.fn();
    mockUseSpacesReturn({ spaces: [buildSpace({ id: "space-1", viewType: "LIST" })], changeSpaceView });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Tablero" }));

    expect(changeSpaceView).toHaveBeenCalledWith("space-1", "KANBAN");
  });

  it("filters tasks by priority", async () => {
    mockUseTasksReturn({
      tasks: [
        buildTask({ id: "t1", title: "Tarea alta", priority: "HIGH" }),
        buildTask({ id: "t2", title: "Tarea baja", priority: "LOW" }),
      ],
    });
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText(/Tarea alta/)).toBeInTheDocument();
    expect(screen.getByText(/Tarea baja/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Alta" }));

    expect(screen.getByText(/Tarea alta/)).toBeInTheDocument();
    expect(screen.queryByText(/Tarea baja/)).not.toBeInTheDocument();
  });

  it("opens the task detail modal when a task is clicked", async () => {
    mockUseTasksReturn({ tasks: [buildTask({ title: "Comprar leche" })] });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText(/Comprar leche/));

    expect(screen.getByLabelText("Título de la tarea")).toHaveValue("Comprar leche");
  });

  it("creates a task via the quick-add form", async () => {
    const createTask = vi.fn().mockResolvedValue(undefined);
    mockUseTasksReturn({ createTask });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Nueva tarea..."), "Comprar pan");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ title: "Comprar pan" }));
  });
});
