import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../../../../shared/infrastructure/persistence/prisma-client.js", () => ({ prisma: prismaMock }));

const { PrismaUserRepository } = await import("./prisma-user.repository.js");
const { User } = await import("../../domain/user.entity.js");

const userRecord = {
  id: "user-1",
  email: "user@example.com",
  passwordHash: "hashed",
  name: "Test User",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("PrismaUserRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findById maps a found record to a domain User", async () => {
    prismaMock.user.findUnique.mockResolvedValue(userRecord);
    const repository = new PrismaUserRepository();

    const user = await repository.findById("user-1");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(user?.email).toBe("user@example.com");
  });

  it("findById returns null when no record is found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const repository = new PrismaUserRepository();

    expect(await repository.findById("missing")).toBeNull();
  });

  it("findByEmail queries by email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(userRecord);
    const repository = new PrismaUserRepository();

    await repository.findByEmail("user@example.com");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
  });

  it("save upserts the user by id with the domain fields", async () => {
    prismaMock.user.upsert.mockResolvedValue(userRecord);
    const repository = new PrismaUserRepository();
    const user = User.create(userRecord);

    await repository.save(user);

    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { id: "user-1" },
      create: { id: "user-1", email: "user@example.com", passwordHash: "hashed", name: "Test User" },
      update: { email: "user@example.com", passwordHash: "hashed", name: "Test User" },
    });
  });
});
