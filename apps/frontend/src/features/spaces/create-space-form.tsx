import { useState, type FormEvent } from "react";

const DEFAULT_COLOR = "#6366f1";

export function CreateSpaceForm({ onCreate }: { onCreate: (input: { name: string; icon?: string; color?: string }) => Promise<void> }): JSX.Element {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!name.trim()) return;
    await onCreate({ name, icon: icon || undefined, color });
    setName("");
    setIcon("");
    setColor(DEFAULT_COLOR);
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="create-space-trigger" onClick={() => setOpen(true)}>
        + Nuevo espacio
      </button>
    );
  }

  return (
    <form className="create-space-form" onSubmit={handleSubmit}>
      <input placeholder="Nombre del espacio" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <input placeholder="Emoji (opcional)" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} />
      <div className="create-space-form__color-row">
        <span className="create-space-form__color-label">Color</span>
        <label className="space-color-btn" style={{ background: color }} title="Elegir color">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="space-color-input" />
        </label>
      </div>
      <div className="create-space-form__actions">
        <button type="submit">Crear</button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
