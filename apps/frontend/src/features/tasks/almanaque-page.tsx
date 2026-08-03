import { useState } from "react";
import { useSpaces } from "../spaces/use-spaces";
import { useSpaceFilter } from "../spaces/use-space-filter";
import { SpaceFilterBar } from "../spaces/space-filter-bar";
import { useMyTasks } from "./use-my-tasks";
import { CalendarView } from "./views/calendar-view";
import { TaskDetailModal } from "./task-detail-modal";
import type { Task } from "./types";

export function AlmanaquePage(): JSX.Element {
  const { spaces } = useSpaces();
  const { tasks, loading, error, createTask, updateTask, updateStatus, addSubtask, toggleSubtask, deleteSubtask, deleteTask } = useMyTasks();
  const { visibleSpaceIds, toggleSpace } = useSpaceFilter(spaces);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const visibleTasks = tasks.filter((task) => visibleSpaceIds.has(task.spaceId));
  const hiddenTasks = tasks.filter((task) => !visibleSpaceIds.has(task.spaceId));
  const selectedTask = selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null;

  function handleOpenTask(task: Task): void {
    setSelectedTaskId(task.id);
  }

  return (
    <div className="page">
      <h1>Almanaque</h1>

      {error && <p className="auth-error">{error}</p>}
      {loading && <p>Cargando...</p>}

      <SpaceFilterBar spaces={spaces} visibleSpaceIds={visibleSpaceIds} onToggle={toggleSpace} />

      <CalendarView
        tasks={visibleTasks}
        hiddenTasks={hiddenTasks}
        spaceOptions={spaces}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onUpdateStatus={updateStatus}
        onOpenTask={handleOpenTask}
      />

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
