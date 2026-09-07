import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanView } from "./kanban-view";
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

function columnHeading(label: string): HTMLElement {
  return screen.getByText(new RegExp(label)).closest("h3")!;
}

describe("KanbanView", () => {
  it("renders the three fixed columns", () => {
    render(<KanbanView tasks={[]} onStatusChange={vi.fn()} />);

    expect(columnHeading("Por hacer")).toBeInTheDocument();
    expect(columnHeading("En progreso")).toBeInTheDocument();
    expect(columnHeading("Hecho")).toBeInTheDocument();
  });

  it("places each task under its status column with the correct count", () => {
    render(
      <KanbanView
        tasks={[
          buildTask({ id: "t1", status: "TODO" }),
          buildTask({ id: "t2", status: "IN_PROGRESS", title: "Comprar pan" }),
          buildTask({ id: "t3", status: "DONE", title: "Comprar huevos" }),
        ]}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Comprar leche")).toBeInTheDocument();
    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
    expect(screen.getByText("Comprar huevos")).toBeInTheDocument();
    expect(columnHeading("Por hacer").querySelector(".kanban-column__count")).toHaveTextContent("1");
  });

  it("calls onOpenTask when a card is clicked", async () => {
    const onOpenTask = vi.fn();
    const task = buildTask();
    const user = userEvent.setup();
    render(<KanbanView tasks={[task]} onStatusChange={vi.fn()} onOpenTask={onOpenTask} />);

    await user.click(screen.getByText("Comprar leche"));

    expect(onOpenTask).toHaveBeenCalledWith(task);
  });

  it("shows a zero count for empty columns", () => {
    render(<KanbanView tasks={[]} onStatusChange={vi.fn()} />);

    expect(columnHeading("Hecho").querySelector(".kanban-column__count")).toHaveTextContent("0");
  });
});
