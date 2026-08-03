import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { DayCellContentArg, EventClickArg } from "@fullcalendar/core";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { DayDetailModal, type SpaceOption } from "./day-detail-modal";
import { calendarDateKey as dateKey, hasExplicitTime } from "../date-utils";

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const key = dateKey(task.dueDate);
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  return groups;
}

export function CalendarView({
  tasks,
  hiddenTasks = [],
  spaceOptions = [],
  spaceColor,
  onCreateTask,
  onUpdateTask,
  onUpdateStatus,
  onOpenTask,
}: {
  tasks: Task[];
  hiddenTasks?: Task[];
  spaceOptions?: SpaceOption[];
  spaceColor?: string | null;
  onCreateTask?: (spaceId: string, input: { title: string; dueDate: string; priority?: TaskPriority }) => Promise<void>;
  onUpdateTask?: (spaceId: string, taskId: string, input: { title?: string; dueDate?: string | null }) => Promise<void>;
  onUpdateStatus?: (spaceId: string, taskId: string, status: TaskStatus) => Promise<void>;
  onOpenTask?: (task: Task) => void;
}): JSX.Element {
  const groups = useMemo(() => groupByDate(tasks), [tasks]);
  const hiddenGroups = useMemo(() => groupByDate(hiddenTasks), [hiddenTasks]);
  const spaceColorMap = useMemo(
    () => new Map(spaceOptions.map((s) => [s.id, s.color ?? undefined])),
    [spaceOptions],
  );
  const undated = tasks.filter((task) => !task.dueDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const events = tasks
    .filter((task) => task.dueDate)
    .map((task) => {
      const color = spaceColor ?? spaceColorMap.get(task.spaceId) ?? undefined;
      return hasExplicitTime(task.dueDate!)
        ? { id: task.id, title: task.title, start: task.dueDate!, allDay: false, backgroundColor: color, borderColor: color }
        : { id: task.id, title: task.title, date: dateKey(task.dueDate!), allDay: true, backgroundColor: color, borderColor: color };
    });

  function renderDayCell(arg: DayCellContentArg): JSX.Element {
    const count = groups.get(localDateKey(arg.date))?.length ?? 0;
    return (
      <div className="calendar-day-cell">
        <span>{arg.dayNumberText}</span>
        {count > 0 && (
          <span
            className="calendar-day-cell__badge"
            style={spaceColor ? { background: spaceColor } : undefined}
          >
            {count}
          </span>
        )}
      </div>
    );
  }

  function handleDateClick(arg: DateClickArg): void {
    setSelectedDate(arg.dateStr);
  }

  function handleEventClick(arg: EventClickArg): void {
    const task = tasks.find((t) => t.id === arg.event.id);
    if (task && onOpenTask) {
      onOpenTask(task);
    } else if (arg.event.start) {
      setSelectedDate(localDateKey(arg.event.start));
    }
  }

  const selectedTasks = selectedDate ? groups.get(selectedDate) ?? [] : [];
  const selectedHiddenCount = selectedDate ? hiddenGroups.get(selectedDate)?.length ?? 0 : 0;
  const canManageTasks = onCreateTask && onUpdateTask && onUpdateStatus;

  return (
    <div className="calendar-view">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        height="auto"
        events={events}
        dayCellContent={renderDayCell}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{ left: "title", right: "prev,next today" }}
      />

      {selectedDate && canManageTasks && (
        <DayDetailModal
          dateKey={selectedDate}
          tasks={selectedTasks}
          hiddenCount={selectedHiddenCount}
          spaceOptions={spaceOptions}
          onClose={() => setSelectedDate(null)}
          onCreateTask={onCreateTask}
          onUpdateTask={onUpdateTask}
          onUpdateStatus={onUpdateStatus}
          onOpenTask={onOpenTask}
        />
      )}

      {undated.length > 0 && (
        <div className="calendar-day calendar-day--undated">
          <h3>Sin fecha</h3>
          <ul>
            {undated.map((task) => (
              <li
                key={task.id}
                onClick={onOpenTask ? () => onOpenTask(task) : undefined}
                style={onOpenTask ? { cursor: "pointer" } : undefined}
              >
                {task.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
