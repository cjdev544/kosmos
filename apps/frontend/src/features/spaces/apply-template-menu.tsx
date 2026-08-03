import { useSpaceTemplates } from "./use-space-templates";

export function ApplyTemplateMenu({ onApply }: { onApply: (templateId: string) => Promise<void> }): JSX.Element | null {
  const templates = useSpaceTemplates();

  if (templates.length === 0) return null;

  return (
    <div className="apply-template-menu">
      <span>Plantillas:</span>
      {templates.map((template) => (
        <button key={template.id} type="button" onClick={() => onApply(template.id)}>
          {template.label}
        </button>
      ))}
    </div>
  );
}
