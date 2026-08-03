export interface SubtaskProps {
  id: string;
  title: string;
  done: boolean;
  position: number;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Subtask {
  private constructor(private props: SubtaskProps) {}

  static create(props: SubtaskProps): Subtask {
    return new Subtask(props);
  }

  get id(): string {
    return this.props.id;
  }

  get taskId(): string {
    return this.props.taskId;
  }

  update(changes: { title?: string; done?: boolean }): void {
    if (changes.title !== undefined) this.props.title = changes.title;
    if (changes.done !== undefined) this.props.done = changes.done;
    this.props.updatedAt = new Date();
  }

  toSnapshot(): SubtaskProps {
    return { ...this.props };
  }
}
