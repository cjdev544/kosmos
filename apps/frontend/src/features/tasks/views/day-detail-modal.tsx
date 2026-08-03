import { useState, type FormEvent } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { combineDateAndTime, formatDate, formatTime, formatTimeInput, hasExplicitTime } from "../date-utils";

export interface SpaceOption {
  id: string;
  name: string;
  icon: string | null;
  color?: string | null;
}

const PRIORITY_LABELS: Record<TaskPriority, string> = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" };
const PRIORITY_DOT: Record<TaskPriority, string> = {
  HIGH: "priority-dot priority-dot--high",
  MEDIUM: "priority-dot priority-dot--medium",
  LOW: "priority-dot priority-dot--low",
};

function formatDateLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { dateStyle: "long" });
}

export function DayDetailModal({
  dateKey,
  tasks,
  hiddenCount,
  spaceOptions,
  onClose,
  onCreateTask,
  onUpdateTask,
  onUpdateStatus,
  onOpenTask,
}: {
  dateKey: string;
  tasks: Task[];
  hiddenCount: number;
  spaceOptions: SpaceOption[];
  onClose: () => void;
  onCreateTask: (spaceId: string, input: { title: string; dueDate: string; priority?: TaskPriority }) => Promise<void>;
  onUpdateTask: (spaceId: string, taskId: string, input: { title?: string; dueDate?: string | null }) => Promise<void>;
  onUpdateStatus: (spaceId: string, taskId: string, status: TaskStatus) => Promise<void>;
  onOpenTask?: (task: Task) => void;
}): JSX.Element {
  const spacesById = new Map(spaceOptions.map((space) => [space.id, space]));
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newSpaceId, setNewSpaceId] = useState(spaceOptions[0]?.id ?? "");
  const [newPriority, setNewPriority] = useState<TaskPriority>("MEDIUM");

  function startEdit(task: Task): void {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditTime(task.dueDate && hasExplicitTime(task.dueDate) ? formatTimeInput(task.dueDate) : "");
  }

  async function saveEdit(task: Task): Promise<void> {
    if (!editTitle.trim()) return;
    const dueDate = editTime ? combineDateAndTime(dateKey, editTime) : dateKey;
    await onUpdateTask(task.spaceId, task.id, { title: editTitle, dueDate });
    setEditingTaskId(null);
  }

  async function handleAddTask(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!newTitle.trim() || !newSpaceId) return;
    const dueDate = newTime ? combineDateAndTime(dateKey, newTime) : dateKey;
    await onCreateTask(newSpaceId, { title: newTitle, dueDate, priority: newPriority });
    setNewTitle("");
    setNewTime("");
    setNewPriority("MEDIUM");
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{formatDateLabel(dateKey)}</h3>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="task-empty">Sin tareas este día.</p>
        ) : (
          <ul className="modal-task-list">
            {tasks.map((task) => {
              const space = spacesById.get(task.spaceId);
              return (
                <li
                  key={task.id}
                  className="modal-task-list__item"
                  style={space?.color ? { borderLeft: `3px solid ${space.color}` } : undefined}
                >
                  {editingTaskId === task.id ? (
                    <form
                      className="modal-task-edit"
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveEdit(task);
                      }}
                    >
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        aria-label="Hora (opcional)"
                      />
                      <button type="submit">Guardar</button>
                      <button type="button" onClick={() => setEditingTaskId(null)}>
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={task.status === "DONE"}
                        onChange={(e) => onUpdateStatus(task.spaceId, task.id, e.target.checked ? "DONE" : "TODO")}
                      />
                      <span
                        className={task.status === "DONE" ? "task-list__title task-list__title--done" : "task-list__title"}
                        onClick={onOpenTask ? () => onOpenTask(task) : undefined}
                        style={onOpenTask ? { cursor: "pointer" } : undefined}
                        title={onOpenTask ? "Ver detalles" : undefined}
                      >
                        <span className={PRIORITY_DOT[task.priority]} title={PRIORITY_LABELS[task.priority]} />
                        {space ? `${space.icon ?? "🗂️"} ` : ""}
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
                      <button type="button" className="modal-task-list__edit" onClick={() => startEdit(task)}>
                        Editar
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {hiddenCount > 0 && (
          <p className="calendar-day-detail__hidden-note">+ {hiddenCount} tarea(s) en espacios no seleccionados.</p>
        )}

        {spaceOptions.length > 0 && (
          <form className="modal-add-task" onSubmit={handleAddTask}>
            {spaceOptions.length > 1 && (
              <select value={newSpaceId} onChange={(e) => setNewSpaceId(e.target.value)}>
                {spaceOptions.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.icon ?? "🗂️"} {space.name}
                  </option>
                ))}
              </select>
            )}
            <input
              placeholder="Nueva tarea para este día..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              aria-label="Prioridad"
            >
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              aria-label="Hora (opcional)"
            />
            <button type="submit">Agregar</button>
          </form>
        )}
      </div>
    </div>
  );
}
