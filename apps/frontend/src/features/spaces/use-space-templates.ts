import { useEffect, useState } from "react";
import * as spacesApi from "./api";
import type { SpaceTemplateOption } from "./types";

export function useSpaceTemplates(): SpaceTemplateOption[] {
  const [templates, setTemplates] = useState<SpaceTemplateOption[]>([]);

  useEffect(() => {
    spacesApi.listTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  return templates;
}
