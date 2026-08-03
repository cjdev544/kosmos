export function hasExplicitTime(dueDate: string): boolean {
  const d = new Date(dueDate);
  return !(d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0);
}

export function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function formatTime(dueDate: string): string {
  return new Date(dueDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function formatTimeInput(dueDate: string): string {
  const d = new Date(dueDate);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function calendarDateKey(dueDate: string): string {
  if (!hasExplicitTime(dueDate)) return dueDate.slice(0, 10);
  const d = new Date(dueDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDate(dueDate: string): string {
  const [y, m, d] = calendarDateKey(dueDate).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
