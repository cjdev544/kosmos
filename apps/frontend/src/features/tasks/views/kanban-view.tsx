import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Task, TaskStatus } from "../types";
import { formatDate, formatTime, hasExplicitTime } from "../date-utils";

// Fades out at the drop position instead of flying back to the source
const DROP_ANIMATION: DropAnimation = {
  duration: 200,
  easing: "ease",
  keyframes({ transform }) {
    const t = CSS.Transform.toString(transform.initial);
    return [
      { opacity: 1, transform: t },
      { opacity: 0, transform: t },
    ];
  },
};

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "Por hacer" },
  { status: "IN_PROGRESS", label: "En progreso" },
  { status: "DONE", label: "Hecho" },
];

const PRIORITY_CLASS: Record<string, string> = {
  HIGH: "priority-dot priority-dot--high",
  MEDIUM: "priority-dot priority-dot--medium",
  LOW: "priority-dot priority-dot--low",
};

function CardContent({ task, accentStyle, style }: { task: Task; accentStyle?: React.CSSProperties; style?: React.CSSProperties }) {
  return (
    <div className="kanban-card" style={{ ...accentStyle, ...style }}>
      <p>
        <span className={PRIORITY_CLASS[task.priority]} title={task.priority} />
        {task.title}
        {task.dueDate && (
          <span className="task-list__time">
            {" "}
            · {formatDate(task.dueDate)}
            {hasExplicitTime(task.dueDate) && ` · ${formatTime(task.dueDate)}`}
          </span>
        )}
        {task.subtasks.length > 0 && (
          <span className="task-list__subtask-count">
            {" "}· {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
          </span>
        )}
      </p>
    </div>
  );
}

function KanbanCard({
  task,
  onOpenTask,
  accentStyle,
}: {
  task: Task;
  onOpenTask?: (task: Task) => void;
  accentStyle?: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ cursor: "grab", opacity: isDragging ? 0.3 : 1 }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging) onOpenTask?.(task);
        e.stopPropagation();
      }}
    >
      <CardContent task={task} accentStyle={accentStyle} />
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  tasks,
  onOpenTask,
  accentStyle,
  isOver,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onOpenTask?: (task: Task) => void;
  accentStyle?: React.CSSProperties;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column${isOver ? " kanban-column--over" : ""}`}
    >
      <h3>{label} <span className="kanban-column__count">{tasks.length}</span></h3>
      {tasks.map((task) => (
        <KanbanCard
          key={task.id}
          task={task}
          onOpenTask={onOpenTask}
          accentStyle={accentStyle}
        />
      ))}
    </div>
  );
}

export function KanbanView({
  tasks,
  onStatusChange,
  onOpenTask,
  spaceColor,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenTask?: (task: Task) => void;
  spaceColor?: string | null;
}): JSX.Element {
  const accentStyle = spaceColor ? { borderLeft: `3px solid ${spaceColor}` } : undefined;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const draggingTask = draggingId ? tasks.find((t) => t.id === draggingId) : null;

  function handleDragStart(event: DragStartEvent): void {
    setDraggingId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent): void {
    const overId = event.over?.id as TaskStatus | undefined;
    setOverColumn(overId && COLUMNS.some((c) => c.status === overId) ? overId : null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    setDraggingId(null);
    setOverColumn(null);
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    if (!COLUMNS.some((c) => c.status === newStatus)) return;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      onStatusChange(task.id, newStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasks.filter((t) => t.status === column.status)}
            onOpenTask={onOpenTask}
            accentStyle={accentStyle}
            isOver={overColumn === column.status}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {draggingTask && (
          <CardContent task={draggingTask} accentStyle={accentStyle} style={{ cursor: "grabbing", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
