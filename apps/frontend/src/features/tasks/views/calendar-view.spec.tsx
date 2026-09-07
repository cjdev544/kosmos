import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { CalendarView } from "./calendar-view";
import type { Task } from "../types";

vi.mock("@fullcalendar/react", () => ({
  default: (props: {
    events: { id: string; start?: string; date?: string }[];
    dateClick: (arg: DateClickArg) => void;
    eventClick: (arg: EventClickArg) => void;
  }) => (
    <div data-testid="full-calendar-mock">
      <button type="button" onClick={() => props.dateClick({ dateStr: "2026-03-15" } as DateClickArg)}>
        trigger-date-click
      </button>
      {props.events.map((event) => (
        <button
          key={event.id}
          type="button"
          onClick={() =>
            props.eventClick({
              event: { id: event.id, start: event.start ? new Date(event.start) : null },
            } as unknown as EventClickArg)
          }
        >
          trigger-event-{event.id}
        </button>
      ))}
    </div>
  ),
}));

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

describe("CalendarView", () => {
  it("lists undated tasks separately", () => {
    render(<CalendarView tasks={[buildTask({ dueDate: null, title: "Tarea suelta" })]} />);

    expect(screen.getByRole("heading", { name: "Sin fecha" })).toBeInTheDocument();
    expect(screen.getByText("Tarea suelta")).toBeInTheDocument();
  });

  it("calls onOpenTask when an undated task is clicked", async () => {
    const onOpenTask = vi.fn();
    const task = buildTask({ dueDate: null, title: "Tarea suelta" });
    const user = userEvent.setup();
    render(<CalendarView tasks={[task]} onOpenTask={onOpenTask} />);

    await user.click(screen.getByText("Tarea suelta"));

    expect(onOpenTask).toHaveBeenCalledWith(task);
  });

  it("opens the day detail modal when a date is clicked and task management is wired up", async () => {
    const task = buildTask({ dueDate: "2026-03-15T00:00:00.000Z", title: "Comprar leche" });
    const user = userEvent.setup();
    render(
      <CalendarView
        tasks={[task]}
        spaceOptions={[{ id: "space-1", name: "Casa", icon: "🏠" }]}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.click(screen.getByText("trigger-date-click"));

    expect(screen.getByText(/Comprar leche/)).toBeInTheDocument();
  });

  it("does not open the day detail modal when task management callbacks are missing", async () => {
    const user = userEvent.setup();
    render(<CalendarView tasks={[]} />);

    await user.click(screen.getByText("trigger-date-click"));

    expect(screen.queryByText("Sin tareas este día.")).not.toBeInTheDocument();
  });

  it("calls onOpenTask when a calendar event is clicked", async () => {
    const onOpenTask = vi.fn();
    const task = buildTask({ id: "task-1", dueDate: "2026-03-15T00:00:00.000Z" });
    const user = userEvent.setup();
    render(<CalendarView tasks={[task]} onOpenTask={onOpenTask} />);

    await user.click(screen.getByText("trigger-event-task-1"));

    expect(onOpenTask).toHaveBeenCalledWith(task);
  });

  it("opens the day modal from an event click when onOpenTask is not provided", async () => {
    const task = buildTask({ id: "task-1", dueDate: "2026-03-15T09:00:00.000Z", title: "Reunión" });
    const user = userEvent.setup();
    render(
      <CalendarView
        tasks={[task]}
        spaceOptions={[{ id: "space-1", name: "Casa", icon: "🏠" }]}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.click(screen.getByText("trigger-event-task-1"));

    expect(screen.getByText(/Reunión/)).toBeInTheDocument();
  });
});
