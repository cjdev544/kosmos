import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSpaces } from "./use-spaces";
import { useTasks } from "../tasks/use-tasks";
import { ListView } from "../tasks/views/list-view";
import { KanbanView } from "../tasks/views/kanban-view";
import { CalendarView } from "../tasks/views/calendar-view";
import { QuickAddTask } from "../tasks/quick-add-task";
import { TaskDetailModal } from "../tasks/task-detail-modal";
import type { Task, TaskPriority } from "../tasks/types";
import type { SpaceViewType } from "./types";

const VIEW_OPTIONS: { value: SpaceViewType; label: string }[] = [
  { value: "LIST", label: "Lista" },
  { value: "CALENDAR", label: "Calendario" },
  { value: "KANBAN", label: "Tablero" },
];

const PRIORITY_OPTIONS: { value: TaskPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: "HIGH", label: "Alta" },
  { value: "MEDIUM", label: "Media" },
  { value: "LOW", label: "Baja" },
];

export function SpaceDetailPage(): JSX.Element {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { spaces, changeSpaceView } = useSpaces();
  const { tasks, createTask, updateTask, updateStatus, addSubtask, toggleSubtask, deleteSubtask, deleteTask, reorderTasks } = useTasks(spaceId!);

  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const space = spaces.find((s) => s.id === spaceId);
  const selectedTask = selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null;

  const filteredTasks =
    priorityFilter === "ALL" ? tasks : tasks.filter((t) => t.priority === priorityFilter);

  function handleOpenTask(task: Task): void {
    setSelectedTaskId(task.id);
  }

  function handleCloseModal(): void {
    setSelectedTaskId(null);
  }

  return (
    <div className="page">
      <Link to="/spaces" className="back-link">
        ← Espacios
      </Link>

      <h1>{space?.icon ?? "🗂️"} {space?.name ?? "Cargando..."}</h1>

      {space && (
        <div className="view-switch">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={space.viewType === option.value ? "view-switch__btn view-switch__btn--active" : "view-switch__btn"}
              onClick={() => changeSpaceView(space.id, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

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

      <QuickAddTask onCreate={createTask} />

      {space?.viewType === "LIST" && (
        <ListView tasks={filteredTasks} onStatusChange={updateStatus} onOpenTask={handleOpenTask} spaceColor={space.color} onReorder={reorderTasks} />
      )}
      {space?.viewType === "KANBAN" && (
        <KanbanView tasks={filteredTasks} onStatusChange={updateStatus} onOpenTask={handleOpenTask} spaceColor={space.color} />
      )}
      {space?.viewType === "CALENDAR" && space && (
        <CalendarView
          tasks={filteredTasks}
          spaceColor={space.color}
          spaceOptions={[{ id: space.id, name: space.name, icon: space.icon }]}
          onCreateTask={(_spaceId, input) => createTask(input)}
          onUpdateTask={(_spaceId, taskId, input) => updateTask(taskId, input)}
          onUpdateStatus={(_spaceId, taskId, status) => updateStatus(taskId, status)}
          onOpenTask={handleOpenTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdateTask={(changes) => updateTask(selectedTask.id, changes)}
          onAddSubtask={(title) => addSubtask(selectedTask.id, title)}
          onToggleSubtask={(subtaskId, done) => toggleSubtask(selectedTask.id, subtaskId, done)}
          onDeleteSubtask={(subtaskId) => deleteSubtask(selectedTask.id, subtaskId)}
          onDeleteTask={() => deleteTask(selectedTask.id)}
        />
      )}
    </div>
  );
}
