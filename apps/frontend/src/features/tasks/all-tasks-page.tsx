import { useState } from "react";
import { useSpaces } from "../spaces/use-spaces";
import { useSpaceFilter } from "../spaces/use-space-filter";
import { SpaceFilterBar } from "../spaces/space-filter-bar";
import { useMyTasks } from "./use-my-tasks";
import { TaskDetailModal } from "./task-detail-modal";
import { formatDate, formatTime, hasExplicitTime } from "./date-utils";
import type { TaskPriority } from "./types";

const PRIORITY_LABELS: Record<TaskPriority, string> = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" };
const PRIORITY_OPTIONS: { value: TaskPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "HIGH", label: "Alta" },
  { value: "MEDIUM", label: "Media" },
  { value: "LOW", label: "Baja" },
];
const PRIORITY_DOT: Record<TaskPriority, string> = {
  HIGH: "priority-dot priority-dot--high",
  MEDIUM: "priority-dot priority-dot--medium",
  LOW: "priority-dot priority-dot--low",
};

export function AllTasksPage(): JSX.Element {
  const { spaces } = useSpaces();
  const { tasks, loading, error, updateTask, updateStatus, addSubtask, toggleSubtask, deleteSubtask, deleteTask } = useMyTasks();
  const { visibleSpaceIds, toggleSpace, visibleSpaces } = useSpaceFilter(spaces);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");

  const selectedTask = selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null;
  const filteredTasks = priorityFilter === "ALL" ? tasks : tasks.filter((t) => t.priority === priorityFilter);

  return (
    <div className="page">
      <h1>Todas las tareas</h1>

      {error && <p className="auth-error">{error}</p>}
      {loading && <p>Cargando...</p>}

      <SpaceFilterBar spaces={spaces} visibleSpaceIds={visibleSpaceIds} onToggle={toggleSpace} />

      <div className="priority-filter">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={priorityFilter === opt.value ? "priority-filter__btn priority-filter__btn--active" : "priority-filter__btn"}
            onClick={() => setPriorityFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="all-tasks-board">
        {visibleSpaces.map((space) => {
          const spaceTasks = filteredTasks.filter((task) => task.spaceId === space.id);
          return (
            <div key={space.id} className="all-tasks-group" style={{ borderColor: space.color ?? undefined }}>
              <h3>
                {space.icon ?? "🗂️"} {space.name}
              </h3>
              {spaceTasks.length === 0 ? (
                <p className="task-empty">Sin tareas.</p>
              ) : (
                <ul className="task-list">
                  {spaceTasks.map((task) => (
                    <li key={task.id} className="task-list__item" style={space.color ? { borderLeft: `3px solid ${space.color}` } : undefined}>
                      <input
                        type="checkbox"
                        checked={task.status === "DONE"}
                        onChange={(e) => updateStatus(space.id, task.id, e.target.checked ? "DONE" : "TODO")}
                      />
                      <span
                        className={task.status === "DONE" ? "task-list__title task-list__title--done" : "task-list__title"}
                        onClick={() => setSelectedTaskId(task.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className={PRIORITY_DOT[task.priority]} title={PRIORITY_LABELS[task.priority]} />
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
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {visibleSpaces.length === 0 && <p className="task-empty">Marca al menos un espacio para ver sus tareas.</p>}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={(changes) => updateTask(selectedTask.spaceId, selectedTask.id, changes)}
          onAddSubtask={(title) => addSubtask(selectedTask.spaceId, selectedTask.id, title)}
          onToggleSubtask={(subtaskId, done) => toggleSubtask(selectedTask.spaceId, selectedTask.id, subtaskId, done)}
          onDeleteSubtask={(subtaskId) => deleteSubtask(selectedTask.spaceId, selectedTask.id, subtaskId)}
          onDeleteTask={() => deleteTask(selectedTask.spaceId, selectedTask.id)}
        />
      )}
    </div>
  );
}
