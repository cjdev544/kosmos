import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import type { Task, TaskStatus } from "../types";
import { formatDate, formatTime, hasExplicitTime } from "../date-utils";

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

const PRIORITY_CLASS: Record<string, string> = {
  HIGH: "priority-dot priority-dot--high",
  MEDIUM: "priority-dot priority-dot--medium",
  LOW: "priority-dot priority-dot--low",
};

function TaskRowContent({
  task,
  accentStyle,
  isOverlay,
}: {
  task: Task;
  accentStyle?: React.CSSProperties;
  isOverlay?: boolean;
}) {
  return (
    <li
      className="task-list__item"
      style={{
        ...accentStyle,
        ...(isOverlay
          ? { boxShadow: "0 4px 16px rgba(0,0,0,0.15)", background: "var(--surface)", cursor: "grabbing" }
          : undefined),
      }}
    >
      <span className="task-list__drag-handle" style={{ cursor: isOverlay ? "grabbing" : "grab" }}>
        ⠿
      </span>
      <input type="checkbox" checked={task.status === "DONE"} readOnly />
      <span className={task.status === "DONE" ? "task-list__title task-list__title--done" : "task-list__title"}>
        <span className={PRIORITY_CLASS[task.priority]} title={task.priority} />
        {task.title}
        {task.dueDate && (
          <span className="task-list__time">
            {" "}· {formatDate(task.dueDate)}
            {hasExplicitTime(task.dueDate) && ` · ${formatTime(task.dueDate)}`}
          </span>
        )}
        {task.subtasks.length > 0 && (
          <span className="task-list__subtask-count">
            {" "}· {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
          </span>
        )}
      </span>
    </li>
  );
}

function SortableTaskRow({
  task,
  isActivelyDragged,
  onStatusChange,
  onOpenTask,
  accentStyle,
}: {
  task: Task;
  isActivelyDragged: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenTask?: (task: Task) => void;
  accentStyle?: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        ...accentStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        // Ghost is fully hidden; the DragOverlay shows it instead
        opacity: isActivelyDragged ? 0 : 1,
        pointerEvents: isActivelyDragged ? "none" : undefined,
      }}
      className="task-list__item"
    >
      <span
        className="task-list__drag-handle"
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
        title="Arrastrar para reordenar"
      >
        ⠿
      </span>
      <input
        type="checkbox"
        checked={task.status === "DONE"}
        onChange={(e) => onStatusChange(task.id, e.target.checked ? "DONE" : "TODO")}
      />
      <span
        className={task.status === "DONE" ? "task-list__title task-list__title--done" : "task-list__title"}
        onClick={() => onOpenTask?.(task)}
        style={onOpenTask ? { cursor: "pointer" } : undefined}
      >
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
      </span>
    </li>
  );
}

export function ListView({
  tasks,
  onStatusChange,
  onOpenTask,
  onReorder,
  spaceColor,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onOpenTask?: (task: Task) => void;
  onReorder?: (taskIds: string[]) => void;
  spaceColor?: string | null;
}): JSX.Element {
  const accentStyle = spaceColor ? { borderLeft: `3px solid ${spaceColor}` } : undefined;

  // Local ordering updated live during drag via onDragOver, so when
  // drag ends the DOM is already in the correct order — no backward animation.
  const [localIds, setLocalIds] = useState<string[]>(() => tasks.map((t) => t.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  // Keep localIds in sync with external task changes (add/delete), but only when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalIds(tasks.map((t) => t.id));
    }
  }, [tasks]);

  const draggingTask = draggingId ? (tasks.find((t) => t.id === draggingId) ?? null) : null;
  const orderedTasks = localIds.map((id) => tasks.find((t) => t.id === id)).filter(Boolean) as Task[];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragStart(event: DragStartEvent): void {
    isDraggingRef.current = true;
    setDraggingId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalIds((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleDragEnd(): void {
    isDraggingRef.current = false;
    setDraggingId(null);
    // localIds already reflects the final order set incrementally via onDragOver
    onReorder?.(localIds);
  }

  function handleDragCancel(): void {
    isDraggingRef.current = false;
    setDraggingId(null);
    setLocalIds(tasks.map((t) => t.id));
  }

  if (tasks.length === 0) return <p className="task-empty">Sin tareas todavía.</p>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={localIds} strategy={verticalListSortingStrategy}>
        <ul className="task-list">
          {orderedTasks.map((task) => (
            <SortableTaskRow
              key={task.id}
              task={task}
              isActivelyDragged={task.id === draggingId}
              onStatusChange={onStatusChange}
              onOpenTask={onOpenTask}
              accentStyle={accentStyle}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {draggingTask && (
          <ul className="task-list" style={{ margin: 0, padding: 0 }}>
            <TaskRowContent task={draggingTask} accentStyle={accentStyle} isOverlay />
          </ul>
        )}
      </DragOverlay>
    </DndContext>
  );
}
