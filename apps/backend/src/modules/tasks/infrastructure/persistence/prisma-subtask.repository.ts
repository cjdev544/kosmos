import { injectable } from "tsyringe";
import { prisma } from "../../../../shared/infrastructure/persistence/prisma-client.js";
import { Subtask, SubtaskProps } from "../../domain/subtask.entity.js";
import type { SubtaskRepository } from "../../domain/ports.js";

@injectable()
export class PrismaSubtaskRepository implements SubtaskRepository {
  async findById(id: string): Promise<Subtask | null> {
    const record = await prisma.subtask.findUnique({ where: { id } });
    return record ? Subtask.create(record) : null;
  }

  async findAllByTask(taskId: string): Promise<Subtask[]> {
    const records = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { position: "asc" },
    });
    return records.map((r) => Subtask.create(r));
  }

  async save(subtask: Subtask): Promise<void> {
    const snap = subtask.toSnapshot();
    await prisma.subtask.upsert({
      where: { id: snap.id },
      create: {
        id: snap.id,
        title: snap.title,
        done: snap.done,
        position: snap.position,
        taskId: snap.taskId,
      },
      update: {
        title: snap.title,
        done: snap.done,
        position: snap.position,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.subtask.delete({ where: { id } });
  }
}
