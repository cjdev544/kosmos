import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListView } from "./list-view";
import type { Task } from "../types";

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

describe("ListView", () => {
  it("shows an empty state when there are no tasks", () => {
    render(<ListView tasks={[]} onStatusChange={vi.fn()} />);

    expect(screen.getByText("Sin tareas todavía.")).toBeInTheDocument();
  });

  it("renders every task's title", () => {
    render(
      <ListView
        tasks={[buildTask({ id: "t1", title: "Comprar leche" }), buildTask({ id: "t2", title: "Comprar pan" })]}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Comprar leche/)).toBeInTheDocument();
    expect(screen.getByText(/Comprar pan/)).toBeInTheDocument();
  });

  it("shows the subtask completion count", () => {
    render(
      <ListView
        tasks={[
          buildTask({
            subtasks: [
              { id: "s1", taskId: "task-1", title: "a", done: true, position: 0 },
              { id: "s2", taskId: "task-1", title: "b", done: false, position: 1 },
            ],
          }),
        ]}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });

  it("checking the checkbox reports a DONE status change", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<ListView tasks={[buildTask({ id: "task-1", status: "TODO" })]} onStatusChange={onStatusChange} />);

    await user.click(screen.getByRole("checkbox"));

    expect(onStatusChange).toHaveBeenCalledWith("task-1", "DONE");
  });

  it("unchecking the checkbox reports a TODO status change", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<ListView tasks={[buildTask({ id: "task-1", status: "DONE" })]} onStatusChange={onStatusChange} />);

    await user.click(screen.getByRole("checkbox"));

    expect(onStatusChange).toHaveBeenCalledWith("task-1", "TODO");
  });

  it("calls onOpenTask when a task title is clicked", async () => {
    const onOpenTask = vi.fn();
    const task = buildTask();
    const user = userEvent.setup();
    render(<ListView tasks={[task]} onStatusChange={vi.fn()} onOpenTask={onOpenTask} />);

    await user.click(screen.getByText(/Comprar leche/));

    expect(onOpenTask).toHaveBeenCalledWith(task);
  });
});
