import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Space } from "./types";

const VIEW_LABELS: Record<Space["viewType"], string> = {
  LIST: "Lista",
  CALENDAR: "Calendario",
  KANBAN: "Tablero",
};

export function SpaceCard({
  space,
  taskCount,
  onToggle,
  onDelete,
  onColorChange,
}: {
  space: Space;
  taskCount: number;
  onToggle: (spaceId: string) => void;
  onDelete: (spaceId: string) => void;
  onColorChange: (spaceId: string, color: string) => void;
}): JSX.Element {
  const [localColor, setLocalColor] = useState(space.color ?? "#6366f1");

  useEffect(() => {
    setLocalColor(space.color ?? "#6366f1");
  }, [space.color]);

  function handleDelete(): void {
    const message =
      taskCount > 0
        ? `Este espacio tiene ${taskCount} tarea(s). Si lo eliminas, también se eliminarán. ¿Eliminar de todas formas?`
        : `¿Eliminar el espacio "${space.name}"?`;
    if (window.confirm(message)) {
      onDelete(space.id);
    }
  }

  return (
    <div className={`space-card ${space.isActive ? "" : "space-card--inactive"}`} style={{ borderColor: localColor }}>
      <Link to={`/spaces/${space.id}`} className="space-card__main">
        <span className="space-card__icon">{space.icon ?? "🗂️"}</span>
        <div>
          <p className="space-card__name">{space.name}</p>
          <p className="space-card__view">{VIEW_LABELS[space.viewType]}</p>
        </div>
      </Link>
      <label className="space-color-btn" title="Cambiar color" style={{ background: localColor }}>
        <input
          type="color"
          className="space-color-input"
          value={localColor}
          onChange={(e) => setLocalColor(e.target.value)}
          onBlur={(e) => onColorChange(space.id, e.target.value)}
        />
      </label>
      <button
        type="button"
        className="space-card__toggle"
        onClick={() => onToggle(space.id)}
        aria-pressed={space.isActive}
      >
        {space.isActive ? "Activo" : "Inactivo"}
      </button>
      <button type="button" className="space-card__delete" onClick={handleDelete} aria-label={`Eliminar ${space.name}`}>
        🗑️
      </button>
    </div>
  );
}
