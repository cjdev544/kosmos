import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    subtask: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../../../../shared/infrastructure/persistence/prisma-client.js", () => ({ prisma: prismaMock }));

const { PrismaSubtaskRepository } = await import("./prisma-subtask.repository.js");
const { Subtask } = await import("../../domain/subtask.entity.js");

const subtaskRecord = {
  id: "subtask-1",
  title: "Comprar huevos",
  done: false,
  position: 0,
  taskId: "task-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("PrismaSubtaskRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findById maps a found record to a domain Subtask", async () => {
    prismaMock.subtask.findUnique.mockResolvedValue(subtaskRecord);
    const repository = new PrismaSubtaskRepository();

    const subtask = await repository.findById("subtask-1");

    expect(prismaMock.subtask.findUnique).toHaveBeenCalledWith({ where: { id: "subtask-1" } });
    expect(subtask?.taskId).toBe("task-1");
  });

  it("findById returns null when no record is found", async () => {
    prismaMock.subtask.findUnique.mockResolvedValue(null);
    const repository = new PrismaSubtaskRepository();

    expect(await repository.findById("missing")).toBeNull();
  });

  it("findAllByTask orders by position ascending", async () => {
    prismaMock.subtask.findMany.mockResolvedValue([subtaskRecord]);
    const repository = new PrismaSubtaskRepository();

    const subtasks = await repository.findAllByTask("task-1");

    expect(prismaMock.subtask.findMany).toHaveBeenCalledWith({
      where: { taskId: "task-1" },
      orderBy: { position: "asc" },
    });
    expect(subtasks).toHaveLength(1);
  });

  it("save upserts the subtask snapshot", async () => {
    prismaMock.subtask.upsert.mockResolvedValue(subtaskRecord);
    const repository = new PrismaSubtaskRepository();
    const subtask = Subtask.create(subtaskRecord);

    await repository.save(subtask);

    expect(prismaMock.subtask.upsert).toHaveBeenCalledWith({
      where: { id: "subtask-1" },
      create: { id: "subtask-1", title: "Comprar huevos", done: false, position: 0, taskId: "task-1" },
      update: { title: "Comprar huevos", done: false, position: 0 },
    });
  });

  it("delete removes the subtask by id", async () => {
    const repository = new PrismaSubtaskRepository();

    await repository.delete("subtask-1");

    expect(prismaMock.subtask.delete).toHaveBeenCalledWith({ where: { id: "subtask-1" } });
  });
});
