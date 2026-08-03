import { useState, type FormEvent } from "react";
import type { Subtask, Task, TaskPriority } from "./types";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export function TaskDetailModal({
  task,
  onClose,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onDeleteTask,
}: {
  task: Task;
  onClose: () => void;
  onUpdateTask: (changes: { title?: string; description?: string | null; priority?: TaskPriority }) => Promise<void>;
  onAddSubtask: (title: string) => Promise<Subtask>;
  onToggleSubtask: (subtaskId: string, done: boolean) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onDeleteTask: () => Promise<void>;
}): JSX.Element {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const isDirty =
    title.trim() !== task.title ||
    description !== (task.description ?? "") ||
    priority !== task.priority;

  async function handleSave(): Promise<void> {
    if (!isDirty || !title.trim()) return;
    setSaving(true);
    try {
      await onUpdateTask({
        title: title.trim(),
        description: description || null,
        priority,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSubtask(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await onAddSubtask(newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  }

  const doneCount = task.subtasks.filter((s) => s.done).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <input
            className="task-detail-modal__title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Título de la tarea"
          />
          <button
            type="button"
            className="task-detail-modal__delete"
            onClick={async () => {
              if (!window.confirm(`¿Eliminar "${task.title}"?`)) return;
              setDeleting(true);
              try {
                await onDeleteTask();
                onClose();
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting}
            aria-label="Eliminar tarea"
            title="Eliminar tarea"
          >
            {deleting ? "…" : "🗑"}
          </button>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="task-detail-modal__field">
          <label className="task-detail-modal__label">Prioridad</label>
          <div className="task-detail-modal__priority-row">
            {(["HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`priority-badge priority-badge--${p.toLowerCase()}${priority === p ? " priority-badge--active" : ""}`}
                onClick={() => setPriority(p)}
              >
                {PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="task-detail-modal__field">
          <label className="task-detail-modal__label" htmlFor="task-description">
            Descripción
          </label>
          <textarea
            id="task-description"
            className="task-detail-modal__textarea"
            placeholder="Añade una descripción..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {isDirty && (
          <button
            type="button"
            className="task-detail-modal__save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        )}

        <div className="task-detail-modal__field">
          <label className="task-detail-modal__label">
            Subtareas{task.subtasks.length > 0 && ` · ${doneCount}/${task.subtasks.length}`}
          </label>

          <ul className="subtask-list">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id} className="subtask-list__item">
                <input
                  type="checkbox"
                  checked={subtask.done}
                  onChange={(e) => onToggleSubtask(subtask.id, e.target.checked)}
                />
                <span className={subtask.done ? "subtask-list__title subtask-list__title--done" : "subtask-list__title"}>
                  {subtask.title}
                </span>
                <button
                  type="button"
                  className="subtask-list__delete"
                  onClick={() => onDeleteSubtask(subtask.id)}
                  aria-label="Eliminar subtarea"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <form className="subtask-add" onSubmit={handleAddSubtask}>
            <input
              placeholder="Nueva subtarea..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
            />
            <button type="submit">Añadir</button>
          </form>
        </div>
      </div>
    </div>
  );
}
