import { useState, type FormEvent } from "react";
import { combineDateAndTime } from "./date-utils";
import type { TaskPriority } from "./types";

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "HIGH", label: "Alta" },
  { value: "MEDIUM", label: "Media" },
  { value: "LOW", label: "Baja" },
];

export function QuickAddTask({
  onCreate,
}: {
  onCreate: (input: { title: string; priority?: TaskPriority; dueDate?: string }) => Promise<void>;
}): JSX.Element {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!title.trim()) return;
    const finalDueDate = dueDate ? (dueTime ? combineDateAndTime(dueDate, dueTime) : dueDate) : undefined;
    await onCreate({ title, priority, dueDate: finalDueDate });
    setTitle("");
    setPriority("MEDIUM");
    setDueDate("");
    setDueTime("");
  }

  return (
    <form className="quick-add-task" onSubmit={handleSubmit}>
      <input placeholder="Nueva tarea..." value={title} onChange={(e) => setTitle(e.target.value)} />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        aria-label="Prioridad"
        className="quick-add-task__priority"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      {dueDate && (
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          aria-label="Hora (opcional)"
        />
      )}
      <button type="submit">Añadir</button>
    </form>
  );
}
