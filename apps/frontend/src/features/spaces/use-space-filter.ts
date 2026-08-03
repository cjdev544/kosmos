import { useEffect, useState } from "react";
import type { Space } from "./types";

export function useSpaceFilter(spaces: Space[]): {
  visibleSpaceIds: Set<string>;
  toggleSpace: (spaceId: string) => void;
  visibleSpaces: Space[];
} {
  const [visibleSpaceIds, setVisibleSpaceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setVisibleSpaceIds((prev) => {
      if (prev.size > 0) return prev;
      return new Set(spaces.map((space) => space.id));
    });
  }, [spaces]);

  function toggleSpace(spaceId: string): void {
    setVisibleSpaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  }

  const visibleSpaces = spaces.filter((space) => visibleSpaceIds.has(space.id));

  return { visibleSpaceIds, toggleSpace, visibleSpaces };
}
