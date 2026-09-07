import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTasks } from "./use-tasks";
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

describe("useTasks", () => {
  beforeEach(() => {
    vi.mocked(tasksApi.listTasks).mockResolvedValue([]);
  });

  it("loads the tasks of the given space on mount", async () => {
    vi.mocked(tasksApi.listTasks).mockResolvedValue([buildTask()]);

    const { result } = renderHook(() => useTasks("space-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(tasksApi.listTasks).toHaveBeenCalledWith("space-1");
    expect(result.current.tasks).toEqual([buildTask()]);
  });

  it("exposes an error message when loading fails", async () => {
    vi.mocked(tasksApi.listTasks).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useTasks("space-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("network down");
  });

  it("createTask appends the created task", async () => {
    const { result } = renderHook(() => useTasks("space-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const created = buildTask({ id: "task-2" });
    vi.mocked(tasksApi.createTask).mockResolvedValue(created);

    await act(() => result.current.createTask({ title: "Comprar leche" }));

    expect(result.current.tasks).toEqual([created]);
  });

  it("updateStatus patches only the matching task with the server response", async () => {
    vi.mocked(tasksApi.listTasks).mockResolvedValue([buildTask({ id: "task-1" }), buildTask({ id: "task-2" })]);
    const { result } = renderHook(() => useTasks("space-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(tasksApi.updateTaskStatus).mockResolvedValue(buildTask({ id: "task-1", status: "DONE" }));

    await act(() => result.current.updateStatus("task-1", "DONE"));

    expect(result.current.tasks.find((t) => t.id === "task-1")?.status).toBe("DONE");
    expect(result.current.tasks.find((t) => t.id === "task-2")?.status).toBe("TODO");
  });

  it("addSubtask appends the new subtask to the matching task and returns it", async () => {
    vi.mocked(tasksApi.listTasks).mockResolvedValue([buildTask({ id: "task-1" })]);
    const { result } = renderHook(() => useTasks("space-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const subtask = buildSubtask();
    vi.mocked(tasksApi.createSubtask).mockResolvedValue(subtask);

    let returned: Subtask | undefined;
    await act(async () => {
      returned = await result.current.addSubtask("task-1", "Comprar huevos");
    });

    expect(returned).toEqual(subtask);
    expect(result.current.tasks[0]?.subtasks).toEqual([subtask]);
  });

  it("toggleSubtask replaces the matching subtask", async () => {
    const subtask = buildSubtask({ done: false });
    vi.mocked(tasksApi.listTasks).mockResolvedValue([buildTask({ id: "task-1", subtasks: [subtask] })]);
    const { result } = renderHook(() => useTasks("space-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(tasksApi.updateSubtask).mockResolvedValue({ ...subtask, done: true });

    await act(() => result.current.toggleSubtask("task-1", "subtask-1", true));

    expect(result.current.tasks[0]?.subtasks[0]?.done).toBe(true);
  });

  it("deleteSubtask removes the subtask from the matching task", async () => {
    const subtask = buildSubtask();
    vi.mocked(tasksApi.listTasks).mockResolvedValue([buildTask({ id: "task-1", subtasks: [subtask] })]);
    const { result } = renderHook(() => useTasks("space-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(tasksApi.deleteSubtask).mockResolvedValue(undefined);

    await act(() => result.current.deleteSubtask("task-1", "subtask-1"));

    expect(result.current.tasks[0]?.subtasks).toEqual([]);
  });

  it("deleteTask removes the task from local state", async () => {
    vi.mocked(tasksApi.listTasks).mockResolvedValue([buildTask({ id: "task-1" })]);
    const { result } = renderHook(() => useTasks("space-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined);

    await act(() => result.current.deleteTask("task-1"));

    expect(result.current.tasks).toEqual([]);
  });

  describe("reorderTasks", () => {
    it("reorders local state optimistically before the request resolves", async () => {
      vi.mocked(tasksApi.listTasks).mockResolvedValue([
        buildTask({ id: "task-1" }),
        buildTask({ id: "task-2" }),
        buildTask({ id: "task-3" }),
      ]);
      const { result } = renderHook(() => useTasks("space-1"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let resolveReorder!: () => void;
      vi.mocked(tasksApi.reorderTasks).mockReturnValue(
        new Promise((resolve) => {
          resolveReorder = () => resolve(undefined);
        }),
      );

      let reorderPromise!: Promise<void>;
      act(() => {
        reorderPromise = result.current.reorderTasks(["task-3", "task-1"]);
      });

      expect(result.current.tasks.map((t) => t.id)).toEqual(["task-3", "task-1", "task-2"]);

      await act(async () => {
        resolveReorder();
        await reorderPromise;
      });

      expect(tasksApi.reorderTasks).toHaveBeenCalledWith("space-1", ["task-3", "task-1"]);
    });
  });
});
