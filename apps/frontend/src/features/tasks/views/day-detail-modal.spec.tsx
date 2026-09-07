import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DayDetailModal, type SpaceOption } from "./day-detail-modal";
import type { Task } from "../types";

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

function buildSpaceOption(overrides: Partial<SpaceOption> = {}): SpaceOption {
  return { id: "space-1", name: "Trabajo", icon: "💼", color: "#6366f1", ...overrides };
}

function renderModal(props: Partial<Parameters<typeof DayDetailModal>[0]> = {}) {
  return render(
    <DayDetailModal
      dateKey="2026-03-15"
      tasks={[]}
      hiddenCount={0}
      spaceOptions={[buildSpaceOption()]}
      onClose={vi.fn()}
      onCreateTask={vi.fn().mockResolvedValue(undefined)}
      onUpdateTask={vi.fn().mockResolvedValue(undefined)}
      onUpdateStatus={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );
}

describe("DayDetailModal", () => {
  it("shows an empty state when there are no tasks that day", () => {
    renderModal({ tasks: [] });

    expect(screen.getByText("Sin tareas este día.")).toBeInTheDocument();
  });

  it("lists the day's tasks with their space icon", () => {
    renderModal({ tasks: [buildTask({ title: "Comprar leche" })] });

    expect(screen.getByText(/Comprar leche/)).toBeInTheDocument();
  });

  it("shows a note about tasks hidden by the space filter", () => {
    renderModal({ hiddenCount: 2 });

    expect(screen.getByText("+ 2 tarea(s) en espacios no seleccionados.")).toBeInTheDocument();
  });

  it("calls onClose when the backdrop is clicked but not when the modal body is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderModal({ onClose });

    await user.click(screen.getByPlaceholderText("Nueva tarea para este día...").closest(".modal")!);
    expect(onClose).not.toHaveBeenCalled();

    await user.click(container.querySelector(".modal-backdrop")!);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes via the explicit close button", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal({ onClose });

    await user.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("toggles a task's status via the checkbox", async () => {
    const onUpdateStatus = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ tasks: [buildTask({ id: "task-1", spaceId: "space-1" })], onUpdateStatus });

    await user.click(screen.getByRole("checkbox"));

    expect(onUpdateStatus).toHaveBeenCalledWith("space-1", "task-1", "DONE");
  });

  it("calls onOpenTask when a task title is clicked", async () => {
    const onOpenTask = vi.fn();
    const task = buildTask();
    const user = userEvent.setup();
    renderModal({ tasks: [task], onOpenTask });

    await user.click(screen.getByTitle("Ver detalles"));

    expect(onOpenTask).toHaveBeenCalledWith(task);
  });

  it("edits a task's title and saves it", async () => {
    const onUpdateTask = vi.fn().mockResolvedValue(undefined);
    const task = buildTask({ id: "task-1", spaceId: "space-1", title: "Comprar leche" });
    const user = userEvent.setup();
    renderModal({ tasks: [task], onUpdateTask });

    await user.click(screen.getByRole("button", { name: "Editar" }));
    const input = screen.getByDisplayValue("Comprar leche");
    await user.clear(input);
    await user.type(input, "Comprar pan");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onUpdateTask).toHaveBeenCalledWith("space-1", "task-1", { title: "Comprar pan", dueDate: "2026-03-15" });
  });

  it("cancels editing without saving", async () => {
    const onUpdateTask = vi.fn();
    const task = buildTask({ title: "Comprar leche" });
    const user = userEvent.setup();
    renderModal({ tasks: [task], onUpdateTask });

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onUpdateTask).not.toHaveBeenCalled();
    expect(screen.getByText(/Comprar leche/)).toBeInTheDocument();
  });

  it("adds a new task for the day", async () => {
    const onCreateTask = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ spaceOptions: [buildSpaceOption({ id: "space-1" })], onCreateTask });

    await user.type(screen.getByPlaceholderText("Nueva tarea para este día..."), "Comprar huevos");
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(onCreateTask).toHaveBeenCalledWith("space-1", {
      title: "Comprar huevos",
      dueDate: "2026-03-15",
      priority: "MEDIUM",
    });
  });

  it("does not render the add-task form when there are no space options", () => {
    renderModal({ spaceOptions: [] });

    expect(screen.queryByPlaceholderText("Nueva tarea para este día...")).not.toBeInTheDocument();
  });

  it("only shows a space selector when there is more than one space option", () => {
    renderModal({ spaceOptions: [buildSpaceOption({ id: "s1" })] });
    expect(screen.queryAllByRole("combobox")).toHaveLength(1);
  });
});
