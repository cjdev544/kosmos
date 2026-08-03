import { injectable } from "tsyringe";
import { prisma } from "../../../../shared/infrastructure/persistence/prisma-client.js";
import { Space, SpaceProps } from "../../domain/space.entity.js";
import { assertSpaceViewType } from "../../domain/space-view-type.vo.js";
import type { SpaceRepository } from "../../domain/ports.js";

type SpaceRecord = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  viewType: string;
  isActive: boolean;
  position: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

@injectable()
export class PrismaSpaceRepository implements SpaceRepository {
  async findById(id: string): Promise<Space | null> {
    const record = await prisma.space.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAllByOwner(ownerId: string): Promise<Space[]> {
    const records = await prisma.space.findMany({
      where: { ownerId },
      orderBy: { position: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async save(space: Space): Promise<void> {
    const snapshot = space.toSnapshot();
    await prisma.space.upsert({
      where: { id: snapshot.id },
      create: {
        id: snapshot.id,
        name: snapshot.name,
        icon: snapshot.icon,
        color: snapshot.color,
        viewType: snapshot.viewType,
        isActive: snapshot.isActive,
        position: snapshot.position,
        ownerId: snapshot.ownerId,
      },
      update: {
        name: snapshot.name,
        icon: snapshot.icon,
        color: snapshot.color,
        viewType: snapshot.viewType,
        isActive: snapshot.isActive,
        position: snapshot.position,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.space.delete({ where: { id } });
  }

  private toDomain(record: SpaceRecord): Space {
    const props: SpaceProps = {
      ...record,
      viewType: assertSpaceViewType(record.viewType),
    };
    return Space.create(props);
  }
}
