export type SpaceViewType = "LIST" | "CALENDAR" | "KANBAN";

export interface Space {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  viewType: SpaceViewType;
  isActive: boolean;
  position: number;
  ownerId: string;
}

export interface SpaceTemplateOption {
  id: string;
  label: string;
}
