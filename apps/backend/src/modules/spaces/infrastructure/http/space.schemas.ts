import { z } from "zod";
import { SPACE_VIEW_TYPES } from "../../domain/space-view-type.vo.js";

export const createSpaceSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  viewType: z.enum(SPACE_VIEW_TYPES).optional(),
});

export const changeSpaceViewSchema = z.object({
  viewType: z.enum(SPACE_VIEW_TYPES),
});

export const changeSpaceColorSchema = z.object({
  color: z.string().nullable(),
});

export const applyTemplateParamsSchema = z.object({
  templateId: z.string().min(1),
});

export type CreateSpaceDto = z.infer<typeof createSpaceSchema>;
export type ChangeSpaceViewDto = z.infer<typeof changeSpaceViewSchema>;
export type ApplyTemplateParamsDto = z.infer<typeof applyTemplateParamsSchema>;
