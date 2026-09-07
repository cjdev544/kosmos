import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    task: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../../../../shared/infrastructure/persistence/prisma-client.js", () => ({ prisma: prismaMock }));

const { PrismaTaskRepository } = await import("./prisma-task.repository.js");
const { Task } = await import("../../domain/task.entity.js");

const INCLUDE_SUBTASKS = { subtasks: { orderBy: { position: "asc" as const } } };

const taskRecord = {
  id: "task-1",
  title: "Comprar leche",
  description: null,
  status: "TODO",
  priority: "MEDIUM",
  dueDate: null,
  position: 0,
  spaceId: "space-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  subtasks: [
    {
      id: "subtask-1",
      title: "Comprar huevos",
      done: false,
      position: 0,
      taskId: "task-1",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
  ],
};

describe("PrismaTaskRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findById includes subtasks ordered by position and maps to a domain Task", async () => {
    prismaMock.task.findUnique.mockResolvedValue(taskRecord);
    const repository = new PrismaTaskRepository();

    const task = await repository.findById("task-1");

    expect(prismaMock.task.findUnique).toHaveBeenCalledWith({ where: { id: "task-1" }, include: INCLUDE_SUBTASKS });
    expect(task?.toSnapshot().subtasks).toHaveLength(1);
  });

  it("findById returns null when no record is found", async () => {
    prismaMock.task.findUnique.mockResolvedValue(null);
    const repository = new PrismaTaskRepository();

    expect(await repository.findById("missing")).toBeNull();
  });

  it("findById throws when the stored status is invalid", async () => {
    prismaMock.task.findUnique.mockResolvedValue({ ...taskRecord, status: "ARCHIVED" });
    const repository = new PrismaTaskRepository();

    await expect(repository.findById("task-1")).rejects.toThrow();
  });

  it("findAllBySpace filters by space and orders by position", async () => {
    prismaMock.task.findMany.mockResolvedValue([taskRecord]);
    const repository = new PrismaTaskRepository();

    await repository.findAllBySpace("space-1");

    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: { spaceId: "space-1" },
      orderBy: { position: "asc" },
      include: INCLUDE_SUBTASKS,
    });
  });

  it("findAllByOwner filters through the space relation", async () => {
    prismaMock.task.findMany.mockResolvedValue([taskRecord]);
    const repository = new PrismaTaskRepository();

    await repository.findAllByOwner("user-1");

    expect(prismaMock.task.findMany).toHaveBeenCalledWith({
      where: { space: { ownerId: "user-1" } },
      orderBy: { position: "asc" },
      include: INCLUDE_SUBTASKS,
    });
  });

  it("delete removes the task by id", async () => {
    const repository = new PrismaTaskRepository();

    await repository.delete("task-1");

    expect(prismaMock.task.delete).toHaveBeenCalledWith({ where: { id: "task-1" } });
  });

  it("reorder updates every task's position within a single transaction", async () => {
    const repository = new PrismaTaskRepository();

    await repository.reorder(["task-1", "task-2"]);

    expect(prismaMock.task.update).toHaveBeenCalledWith({ where: { id: "task-1" }, data: { position: 0 } });
    expect(prismaMock.task.update).toHaveBeenCalledWith({ where: { id: "task-2" }, data: { position: 1 } });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("countBySpaceAndIds scopes the count to the given space and ids", async () => {
    prismaMock.task.count.mockResolvedValue(2);
    const repository = new PrismaTaskRepository();

    const count = await repository.countBySpaceAndIds("space-1", ["task-1", "task-2"]);

    expect(prismaMock.task.count).toHaveBeenCalledWith({
      where: { id: { in: ["task-1", "task-2"] }, spaceId: "space-1" },
    });
    expect(count).toBe(2);
  });

  it("save upserts the task snapshot", async () => {
    prismaMock.task.upsert.mockResolvedValue(taskRecord);
    const repository = new PrismaTaskRepository();
    const task = Task.create({ ...taskRecord, status: "TODO", priority: "MEDIUM" });

    await repository.save(task);

    expect(prismaMock.task.upsert).toHaveBeenCalledWith({
      where: { id: "task-1" },
      create: {
        id: "task-1",
        title: "Comprar leche",
        description: null,
        status: "TODO",
        priority: "MEDIUM",
        dueDate: null,
        position: 0,
        spaceId: "space-1",
      },
      update: {
        title: "Comprar leche",
        description: null,
        status: "TODO",
        priority: "MEDIUM",
        dueDate: null,
        position: 0,
      },
    });
  });
});
