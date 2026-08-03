import { httpClient } from "../../shared/lib/http-client";
import type { Space, SpaceTemplateOption, SpaceViewType } from "./types";

export function listSpaces(): Promise<Space[]> {
  return httpClient.get<Space[]>("/spaces");
}

export function createSpace(input: { name: string; icon?: string; color?: string; viewType?: SpaceViewType }): Promise<Space> {
  return httpClient.post<Space>("/spaces", input);
}

export function toggleSpace(spaceId: string): Promise<Space> {
  return httpClient.patch<Space>(`/spaces/${spaceId}/toggle`, {});
}

export function changeSpaceView(spaceId: string, viewType: SpaceViewType): Promise<Space> {
  return httpClient.patch<Space>(`/spaces/${spaceId}/view`, { viewType });
}

export function listTemplates(): Promise<SpaceTemplateOption[]> {
  return httpClient.get<SpaceTemplateOption[]>("/spaces/templates");
}

export function applyTemplate(templateId: string): Promise<Space[]> {
  return httpClient.post<Space[]>(`/spaces/templates/${templateId}/apply`, {});
}

export function changeSpaceColor(spaceId: string, color: string | null): Promise<Space> {
  return httpClient.patch<Space>(`/spaces/${spaceId}/color`, { color });
}

export function deleteSpace(spaceId: string): Promise<void> {
  return httpClient.delete<void>(`/spaces/${spaceId}`);
}
