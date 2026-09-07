import { describe, expect, it } from "vitest";
import { Task, TaskProps } from "./task.entity.js";
import { ValidationError } from "../../../shared/domain/errors.js";

const validProps: TaskProps = {
  id: "task-1",
  title: "Comprar leche",
  description: null,
  subtasks: [],
  status: "TODO",
  priority: "MEDIUM",
  dueDate: null,
  position: 0,
  spaceId: "space-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

function buildTask(overrides: Partial<TaskProps> = {}): Task {
  return Task.create({ ...validProps, ...overrides });
}

describe("Task", () => {
  it("creates a task with valid props", () => {
    const task = buildTask();

    expect(task.id).toBe("task-1");
    expect(task.spaceId).toBe("space-1");
  });

  it("throws ValidationError when title is empty", () => {
    expect(() => buildTask({ title: "" })).toThrow(ValidationError);
  });

  it("throws ValidationError when title is only whitespace", () => {
    expect(() => buildTask({ title: "   " })).toThrow(ValidationError);
  });

  it("changes status", () => {
    const task = buildTask();

    task.changeStatus("DONE");

    expect(task.toSnapshot().status).toBe("DONE");
  });

  describe("update", () => {
    it("updates only the provided fields", () => {
      const task = buildTask();

      task.update({ title: "Comprar pan" });

      const snapshot = task.toSnapshot();
      expect(snapshot.title).toBe("Comprar pan");
      expect(snapshot.priority).toBe("MEDIUM");
      expect(snapshot.description).toBeNull();
    });

    it("allows clearing description and dueDate by passing null", () => {
      const task = buildTask({ description: "algo", dueDate: new Date("2026-02-01") });

      task.update({ description: null, dueDate: null });

      const snapshot = task.toSnapshot();
      expect(snapshot.description).toBeNull();
      expect(snapshot.dueDate).toBeNull();
    });

    it("leaves fields untouched when they are undefined", () => {
      const task = buildTask({ description: "algo" });

      task.update({ priority: "HIGH" });

      expect(task.toSnapshot().description).toBe("algo");
    });

    it("throws ValidationError when updating to an empty title", () => {
      const task = buildTask();

      expect(() => task.update({ title: "" })).toThrow(ValidationError);
    });

    it("does not mutate the title when validation fails", () => {
      const task = buildTask();

      try {
        task.update({ title: "   " });
      } catch {
        // expected
      }

      expect(task.toSnapshot().title).toBe("Comprar leche");
    });
  });

  it("toSnapshot returns an independent copy of the subtasks array", () => {
    const task = buildTask();
    const snapshot = task.toSnapshot();

    snapshot.subtasks.push({
      id: "s1",
      title: "x",
      done: false,
      position: 0,
      taskId: "task-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(task.toSnapshot().subtasks).toHaveLength(0);
  });
});
