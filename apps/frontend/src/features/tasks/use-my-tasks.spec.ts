import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMyTasks } from "./use-my-tasks";
import * as tasksApi from "./api";
import type { Subtask, Task } from "./types";

vi.mock("./api");

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

describe("useMyTasks", () => {
  beforeEach(() => {
    vi.mocked(tasksApi.listMyTasks).mockResolvedValue([]);
  });

  it("loads tasks across all spaces on mount", async () => {
    vi.mocked(tasksApi.listMyTasks).mockResolvedValue([buildTask()]);

    const { result } = renderHook(() => useMyTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual([buildTask()]);
  });

  it("exposes an error message when loading fails", async () => {
    vi.mocked(tasksApi.listMyTasks).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useMyTasks());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("network down");
  });

  it("createTask appends the created task", async () => {
    const { result } = renderHook(() => useMyTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const created = buildTask({ id: "task-2" });
    vi.mocked(tasksApi.createTask).mockResolvedValue(created);

    await act(() => result.current.createTask("space-1", { title: "Comprar leche" }));

    expect(tasksApi.createTask).toHaveBeenCalledWith("space-1", { title: "Comprar leche" });
    expect(result.current.tasks).toEqual([created]);
  });

  it("updateTask replaces the matching task with the server response", async () => {
    vi.mocked(tasksApi.listMyTasks).mockResolvedValue([buildTask({ id: "task-1" })]);
    const { result } = renderHook(() => useMyTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const updated = buildTask({ id: "task-1", title: "Comprar pan" });
    vi.mocked(tasksApi.updateTask).mockResolvedValue(updated);

    await act(() => result.current.updateTask("space-1", "task-1", { title: "Comprar pan" }));

    expect(result.current.tasks).toEqual([updated]);
  });

  it("addSubtask appends the subtask to the matching task and returns it", async () => {
    vi.mocked(tasksApi.listMyTasks).mockResolvedValue([buildTask({ id: "task-1" })]);
    const { result } = renderHook(() => useMyTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const subtask = buildSubtask();
    vi.mocked(tasksApi.createSubtask).mockResolvedValue(subtask);

    let returned: Subtask | undefined;
    await act(async () => {
      returned = await result.current.addSubtask("space-1", "task-1", "Comprar huevos");
    });

    expect(returned).toEqual(subtask);
    expect(result.current.tasks[0]?.subtasks).toEqual([subtask]);
  });

  it("deleteTask removes the task from local state", async () => {
    vi.mocked(tasksApi.listMyTasks).mockResolvedValue([buildTask({ id: "task-1" })]);
    const { result } = renderHook(() => useMyTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined);

    await act(() => result.current.deleteTask("space-1", "task-1"));

    expect(result.current.tasks).toEqual([]);
  });
});
