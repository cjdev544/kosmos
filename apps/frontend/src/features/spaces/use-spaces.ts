import { useCallback, useEffect, useState } from "react";
import * as spacesApi from "./api";
import type { Space, SpaceViewType } from "./types";

interface UseSpacesResult {
  spaces: Space[];
  loading: boolean;
  error: string | null;
  createSpace: (input: { name: string; icon?: string; color?: string }) => Promise<void>;
  toggleSpace: (spaceId: string) => Promise<void>;
  changeSpaceView: (spaceId: string, viewType: SpaceViewType) => Promise<void>;
  changeSpaceColor: (spaceId: string, color: string | null) => Promise<void>;
  applyTemplate: (templateId: string) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<void>;
}

export function useSpaces(): UseSpacesResult {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setSpaces(await spacesApi.listSpaces());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando espacios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    spaces,
    loading,
    error,
    createSpace: async (input) => {
      const space = await spacesApi.createSpace(input);
      setSpaces((prev) => [...prev, space]);
    },
    toggleSpace: async (spaceId) => {
      const updated = await spacesApi.toggleSpace(spaceId);
      setSpaces((prev) => prev.map((s) => (s.id === spaceId ? updated : s)));
    },
    changeSpaceView: async (spaceId, viewType) => {
      const updated = await spacesApi.changeSpaceView(spaceId, viewType);
      setSpaces((prev) => prev.map((s) => (s.id === spaceId ? updated : s)));
    },
    changeSpaceColor: async (spaceId, color) => {
      const updated = await spacesApi.changeSpaceColor(spaceId, color);
      setSpaces((prev) => prev.map((s) => (s.id === spaceId ? updated : s)));
    },
    applyTemplate: async (templateId) => {
      const created = await spacesApi.applyTemplate(templateId);
      setSpaces((prev) => [...prev, ...created]);
    },
    deleteSpace: async (spaceId) => {
      await spacesApi.deleteSpace(spaceId);
      setSpaces((prev) => prev.filter((s) => s.id !== spaceId));
    },
  };
}
