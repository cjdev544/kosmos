import { useState } from "react";
import { useSpaces } from "../spaces/use-spaces";
import { useMyTasks } from "./use-my-tasks";
import { KanbanView } from "./views/kanban-view";
import { TaskDetailModal } from "./task-detail-modal";
import type { Task } from "./types";

export function TableroPage(): JSX.Element {
  const { spaces } = useSpaces();
  const { tasks, loading, error, updateStatus, updateTask, addSubtask, toggleSubtask, deleteSubtask, deleteTask } =
    useMyTasks();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const spacesWithTasks = spaces.filter((s) => tasks.some((t) => t.spaceId === s.id));
  const selectedSpace = selectedSpaceId ? spaces.find((s) => s.id === selectedSpaceId) ?? null : null;
  const spaceTasks = selectedSpaceId ? tasks.filter((t) => t.spaceId === selectedSpaceId) : [];
  const selectedTask: Task | null = selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null;

  if (loading) return <p className="task-empty">Cargando tableros...</p>;
  if (error) return <p className="task-empty">{error}</p>;

  if (!selectedSpace) {
    return (
      <div className="page">
        <h1 className="tablero-picker__title">Tablero</h1>
        {spacesWithTasks.length === 0 ? (
          <p className="task-empty">Ningún espacio tiene tareas todavía.</p>
        ) : (
          <div className="tablero-picker">
            {spacesWithTasks.map((space) => {
              const st = tasks.filter((t) => t.spaceId === space.id);
              const todo = st.filter((t) => t.status === "TODO").length;
              const inProgress = st.filter((t) => t.status === "IN_PROGRESS").length;
              const done = st.filter((t) => t.status === "DONE").length;
              return (
                <button
                  key={space.id}
                  type="button"
                  className="tablero-space-card"
                  onClick={() => setSelectedSpaceId(space.id)}
                >
                  <span
                    className="tablero-space-card__bar"
                    style={{ background: space.color ?? "var(--accent)" }}
                  />
                  <span className="tablero-space-card__icon">{space.icon ?? "🗂️"}</span>
                  <strong className="tablero-space-card__name">{space.name}</strong>
                  <ul className="tablero-space-card__stats">
                    <li className="tablero-stat tablero-stat--todo">
                      <span>{todo}</span> por hacer
                    </li>
                    <li className="tablero-stat tablero-stat--progress">
                      <span>{inProgress}</span> en progreso
                    </li>
                    <li className="tablero-stat tablero-stat--done">
                      <span>{done}</span> hechas
                    </li>
                  </ul>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const spaceId = selectedSpaceId!;

  return (
    <div className="page">
      <button
        type="button"
        className="back-link"
        onClick={() => {
          setSelectedSpaceId(null);
          setSelectedTaskId(null);
        }}
      >
        ← Tablero
      </button>

      <h1>
        {selectedSpace.icon ?? "🗂️"} {selectedSpace.name}
      </h1>

      <KanbanView
        tasks={spaceTasks}
        onStatusChange={(taskId, status) => updateStatus(spaceId, taskId, status)}
        onOpenTask={(task) => setSelectedTaskId(task.id)}
        spaceColor={selectedSpace.color}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={(changes) => updateTask(spaceId, selectedTask.id, changes)}
          onAddSubtask={(title) => addSubtask(spaceId, selectedTask.id, title)}
          onToggleSubtask={(subtaskId, done) => toggleSubtask(spaceId, selectedTask.id, subtaskId, done)}
          onDeleteSubtask={(subtaskId) => deleteSubtask(spaceId, selectedTask.id, subtaskId)}
          onDeleteTask={() => deleteTask(spaceId, selectedTask.id)}
        />
      )}
    </div>
  );
}
