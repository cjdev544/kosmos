import { describe, expect, it } from "vitest";
import { Subtask, SubtaskProps } from "./subtask.entity.js";

const validProps: SubtaskProps = {
  id: "subtask-1",
  title: "Comprar huevos",
  done: false,
  position: 0,
  taskId: "task-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

function buildSubtask(overrides: Partial<SubtaskProps> = {}): Subtask {
  return Subtask.create({ ...validProps, ...overrides });
}

describe("Subtask", () => {
  it("creates a subtask", () => {
    const subtask = buildSubtask();

    expect(subtask.id).toBe("subtask-1");
    expect(subtask.taskId).toBe("task-1");
  });

  it("updates only the provided fields", () => {
    const subtask = buildSubtask();

    subtask.update({ done: true });

    const snapshot = subtask.toSnapshot();
    expect(snapshot.done).toBe(true);
    expect(snapshot.title).toBe("Comprar huevos");
  });

  it("updates the title", () => {
    const subtask = buildSubtask();

    subtask.update({ title: "Comprar pan" });

    expect(subtask.toSnapshot().title).toBe("Comprar pan");
  });

  it("toSnapshot returns an independent copy", () => {
    const subtask = buildSubtask();
    const snapshot = subtask.toSnapshot();

    subtask.update({ title: "cambiado" });

    expect(snapshot.title).toBe("Comprar huevos");
  });
});
