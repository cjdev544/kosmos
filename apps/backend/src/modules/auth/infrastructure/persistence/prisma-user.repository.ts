import { injectable } from "tsyringe";
import { prisma } from "../../../../shared/infrastructure/persistence/prisma-client.js";
import { User } from "../../domain/user.entity.js";
import type { UserRepository } from "../../domain/ports.js";

@injectable()
export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
      },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
      },
    });
  }

  private toDomain(record: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.create(record);
  }
}
