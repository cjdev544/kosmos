import { injectable } from "tsyringe";
import { prisma } from "../../../../shared/infrastructure/persistence/prisma-client.js";
import { Task, TaskProps, TaskPriority } from "../../domain/task.entity.js";
import { assertTaskStatus } from "../../domain/task-status.vo.js";
import type { TaskRepository } from "../../domain/ports.js";
import type { SubtaskProps } from "../../domain/subtask.entity.js";

type SubtaskRecord = {
  id: string;
  title: string;
  done: boolean;
  position: number;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
};

type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  position: number;
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks: SubtaskRecord[];
};

const INCLUDE_SUBTASKS = { subtasks: { orderBy: { position: "asc" as const } } };

@injectable()
export class PrismaTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    const record = await prisma.task.findUnique({ where: { id }, include: INCLUDE_SUBTASKS });
    return record ? this.toDomain(record) : null;
  }

  async findAllBySpace(spaceId: string): Promise<Task[]> {
    const records = await prisma.task.findMany({
      where: { spaceId },
      orderBy: { position: "asc" },
      include: INCLUDE_SUBTASKS,
    });
    return records.map((record) => this.toDomain(record));
  }

  async findAllByOwner(ownerId: string): Promise<Task[]> {
    const records = await prisma.task.findMany({
      where: { space: { ownerId } },
      orderBy: { position: "asc" },
      include: INCLUDE_SUBTASKS,
    });
    return records.map((record) => this.toDomain(record));
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  async reorder(taskIds: string[]): Promise<void> {
    await prisma.$transaction(
      taskIds.map((id, index) => prisma.task.update({ where: { id }, data: { position: index } })),
    );
  }

  async countBySpaceAndIds(spaceId: string, taskIds: string[]): Promise<number> {
    return prisma.task.count({ where: { id: { in: taskIds }, spaceId } });
  }

  async save(task: Task): Promise<void> {
    const snapshot = task.toSnapshot();
    await prisma.task.upsert({
      where: { id: snapshot.id },
      create: {
        id: snapshot.id,
        title: snapshot.title,
        description: snapshot.description,
        status: snapshot.status,
        priority: snapshot.priority,
        dueDate: snapshot.dueDate,
        position: snapshot.position,
        spaceId: snapshot.spaceId,
      },
      update: {
        title: snapshot.title,
        description: snapshot.description,
        status: snapshot.status,
        priority: snapshot.priority,
        dueDate: snapshot.dueDate,
        position: snapshot.position,
      },
    });
  }

  private toDomain(record: TaskRecord): Task {
    const subtasks: SubtaskProps[] = record.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      done: s.done,
      position: s.position,
      taskId: s.taskId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    const props: TaskProps = {
      id: record.id,
      title: record.title,
      description: record.description,
      subtasks,
      status: assertTaskStatus(record.status),
      priority: record.priority as TaskPriority,
      dueDate: record.dueDate,
      position: record.position,
      spaceId: record.spaceId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Task.create(props);
  }
}
