import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetailModal } from "./task-detail-modal";
import type { Subtask, Task } from "./types";

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

function buildSubtask(overrides: Partial<Subtask> = {}): Subtask {
  return { id: "subtask-1", taskId: "task-1", title: "Comprar huevos", done: false, position: 0, ...overrides };
}

function renderModal(props: Partial<Parameters<typeof TaskDetailModal>[0]> = {}) {
  return render(
    <TaskDetailModal
      task={buildTask()}
      onClose={vi.fn()}
      onUpdateTask={vi.fn().mockResolvedValue(undefined)}
      onAddSubtask={vi.fn().mockResolvedValue(buildSubtask())}
      onToggleSubtask={vi.fn().mockResolvedValue(undefined)}
      onDeleteSubtask={vi.fn().mockResolvedValue(undefined)}
      onDeleteTask={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TaskDetailModal", () => {
  it("does not show the save button until a field is changed", () => {
    renderModal();

    expect(screen.queryByRole("button", { name: /Guardar cambios/ })).not.toBeInTheDocument();
  });

  it("shows the save button once the title is edited and saves the trimmed changes", async () => {
    const onUpdateTask = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ task: buildTask({ title: "Comprar leche" }), onUpdateTask });

    const titleInput = screen.getByLabelText("Título de la tarea");
    await user.clear(titleInput);
    await user.type(titleInput, "Comprar pan  ");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onUpdateTask).toHaveBeenCalledWith({ title: "Comprar pan", description: null, priority: "MEDIUM" });
  });

  it("does not show the save button when the title only differs by trailing whitespace", async () => {
    const user = userEvent.setup();
    renderModal({ task: buildTask({ title: "Comprar leche" }) });

    const titleInput = screen.getByLabelText("Título de la tarea");
    await user.type(titleInput, "   ");

    expect(screen.queryByRole("button", { name: /Guardar cambios/ })).not.toBeInTheDocument();
  });

  it("lets the user change priority and marks the form dirty", async () => {
    const onUpdateTask = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ task: buildTask({ priority: "MEDIUM" }), onUpdateTask });

    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(onUpdateTask).toHaveBeenCalledWith(expect.objectContaining({ priority: "HIGH" }));
  });

  it("shows the current subtask completion count", () => {
    renderModal({
      task: buildTask({
        subtasks: [buildSubtask({ id: "s1", done: true }), buildSubtask({ id: "s2", done: false })],
      }),
    });

    expect(screen.getByText("Subtareas · 1/2")).toBeInTheDocument();
  });

  it("adds a new subtask", async () => {
    const onAddSubtask = vi.fn().mockResolvedValue(buildSubtask());
    const user = userEvent.setup();
    renderModal({ onAddSubtask });

    await user.type(screen.getByPlaceholderText("Nueva subtarea..."), "Comprar huevos");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onAddSubtask).toHaveBeenCalledWith("Comprar huevos");
  });

  it("toggles a subtask", async () => {
    const onToggleSubtask = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ task: buildTask({ subtasks: [buildSubtask({ id: "s1", done: false })] }), onToggleSubtask });

    await user.click(screen.getByRole("checkbox"));

    expect(onToggleSubtask).toHaveBeenCalledWith("s1", true);
  });

  it("deletes a subtask", async () => {
    const onDeleteSubtask = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderModal({ task: buildTask({ subtasks: [buildSubtask({ id: "s1" })] }), onDeleteSubtask });

    await user.click(screen.getByRole("button", { name: "Eliminar subtarea" }));

    expect(onDeleteSubtask).toHaveBeenCalledWith("s1");
  });

  it("deletes the task after confirmation and closes the modal", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDeleteTask = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal({ task: buildTask({ title: "Comprar leche" }), onDeleteTask, onClose });

    await user.click(screen.getByRole("button", { name: "Eliminar tarea" }));

    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar "Comprar leche"?');
    expect(onDeleteTask).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("does not delete the task when the confirmation is dismissed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDeleteTask = vi.fn();
    const user = userEvent.setup();
    renderModal({ onDeleteTask });

    await user.click(screen.getByRole("button", { name: "Eliminar tarea" }));

    expect(onDeleteTask).not.toHaveBeenCalled();
  });

  it("calls onClose from the close button but not when clicking inside the modal", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal({ onClose });

    await user.click(screen.getByLabelText("Título de la tarea"));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalled();
  });
});
