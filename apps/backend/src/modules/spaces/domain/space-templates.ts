import { SpaceViewType } from "./space-view-type.vo.js";

export interface SpaceTemplateSpaceDefinition {
  name: string;
  icon: string;
  color: string;
  viewType: SpaceViewType;
}

export interface SpaceTemplate {
  id: string;
  label: string;
  spaces: SpaceTemplateSpaceDefinition[];
}

export const SPACE_TEMPLATES: SpaceTemplate[] = [
  {
    id: "student",
    label: "Plantilla para Estudiantes",
    spaces: [
      { name: "Estudios", icon: "📚", color: "#6366F1", viewType: "KANBAN" },
      { name: "Bienestar", icon: "🧘", color: "#10B981", viewType: "LIST" },
    ],
  },
  {
    id: "freelancer",
    label: "Plantilla para Freelancers",
    spaces: [
      { name: "Trabajo", icon: "💼", color: "#3B82F6", viewType: "KANBAN" },
      { name: "Finanzas", icon: "💰", color: "#F59E0B", viewType: "LIST" },
    ],
  },
  {
    id: "homemaker",
    label: "Plantilla para Amas de Casa",
    spaces: [
      { name: "Compras", icon: "🛒", color: "#EF4444", viewType: "LIST" },
      { name: "Personal", icon: "🌿", color: "#10B981", viewType: "LIST" },
    ],
  },
];

export function findSpaceTemplate(id: string): SpaceTemplate | undefined {
  return SPACE_TEMPLATES.find((template) => template.id === id);
}
