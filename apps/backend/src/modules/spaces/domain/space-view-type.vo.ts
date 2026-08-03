import { ValidationError } from "../../../shared/domain/errors.js";

export const SPACE_VIEW_TYPES = ["LIST", "CALENDAR", "KANBAN"] as const;

export type SpaceViewType = (typeof SPACE_VIEW_TYPES)[number];

export function assertSpaceViewType(value: string): SpaceViewType {
  if (!SPACE_VIEW_TYPES.includes(value as SpaceViewType)) {
    throw new ValidationError(`Tipo de vista inválido: ${value}`);
  }
  return value as SpaceViewType;
}
