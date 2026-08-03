import type { Space } from "./types";

export function SpaceFilterBar({
  spaces,
  visibleSpaceIds,
  onToggle,
}: {
  spaces: Space[];
  visibleSpaceIds: Set<string>;
  onToggle: (spaceId: string) => void;
}): JSX.Element {
  return (
    <div className="space-filter">
      {spaces.map((space) => (
        <label key={space.id} className="space-filter__item">
          <input type="checkbox" checked={visibleSpaceIds.has(space.id)} onChange={() => onToggle(space.id)} />
          <span>
            {space.icon ?? "🗂️"} {space.name}
          </span>
        </label>
      ))}
    </div>
  );
}
