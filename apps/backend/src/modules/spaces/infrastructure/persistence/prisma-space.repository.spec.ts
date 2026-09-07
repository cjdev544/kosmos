import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    space: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../../../../shared/infrastructure/persistence/prisma-client.js", () => ({ prisma: prismaMock }));

const { PrismaSpaceRepository } = await import("./prisma-space.repository.js");
const { Space } = await import("../../domain/space.entity.js");

const spaceRecord = {
  id: "space-1",
  name: "Trabajo",
  icon: null,
  color: null,
  viewType: "LIST" as const,
  isActive: true,
  position: 0,
  ownerId: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("PrismaSpaceRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findById maps a found record to a domain Space", async () => {
    prismaMock.space.findUnique.mockResolvedValue(spaceRecord);
    const repository = new PrismaSpaceRepository();

    const space = await repository.findById("space-1");

    expect(prismaMock.space.findUnique).toHaveBeenCalledWith({ where: { id: "space-1" } });
    expect(space?.viewType).toBe("LIST");
  });

  it("findById returns null when no record is found", async () => {
    prismaMock.space.findUnique.mockResolvedValue(null);
    const repository = new PrismaSpaceRepository();

    expect(await repository.findById("missing")).toBeNull();
  });

  it("findById throws when the stored viewType is invalid", async () => {
    prismaMock.space.findUnique.mockResolvedValue({ ...spaceRecord, viewType: "GRID" });
    const repository = new PrismaSpaceRepository();

    await expect(repository.findById("space-1")).rejects.toThrow();
  });

  it("findAllByOwner orders by position ascending", async () => {
    prismaMock.space.findMany.mockResolvedValue([spaceRecord]);
    const repository = new PrismaSpaceRepository();

    const spaces = await repository.findAllByOwner("user-1");

    expect(prismaMock.space.findMany).toHaveBeenCalledWith({
      where: { ownerId: "user-1" },
      orderBy: { position: "asc" },
    });
    expect(spaces).toHaveLength(1);
  });

  it("save upserts the space snapshot", async () => {
    prismaMock.space.upsert.mockResolvedValue(spaceRecord);
    const repository = new PrismaSpaceRepository();
    const space = Space.create(spaceRecord);

    await repository.save(space);

    expect(prismaMock.space.upsert).toHaveBeenCalledWith({
      where: { id: "space-1" },
      create: {
        id: "space-1",
        name: "Trabajo",
        icon: null,
        color: null,
        viewType: "LIST",
        isActive: true,
        position: 0,
        ownerId: "user-1",
      },
      update: {
        name: "Trabajo",
        icon: null,
        color: null,
        viewType: "LIST",
        isActive: true,
        position: 0,
      },
    });
  });

  it("delete removes the space by id", async () => {
    const repository = new PrismaSpaceRepository();

    await repository.delete("space-1");

    expect(prismaMock.space.delete).toHaveBeenCalledWith({ where: { id: "space-1" } });
  });
});
