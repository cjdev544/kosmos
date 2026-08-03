import { useSpaces } from "./use-spaces";
import { SpaceCard } from "./space-card";
import { CreateSpaceForm } from "./create-space-form";
import { ApplyTemplateMenu } from "./apply-template-menu";
import { useMyTasks } from "../tasks/use-my-tasks";

export function SpacesPage(): JSX.Element {
  const { spaces, loading, error, createSpace, toggleSpace, changeSpaceColor, applyTemplate, deleteSpace } = useSpaces();
  const { tasks } = useMyTasks();

  return (
    <div className="page">
      <h1>Tus espacios</h1>

      {error && <p className="auth-error">{error}</p>}
      {loading && <p>Cargando...</p>}

      <div className="space-grid">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            taskCount={tasks.filter((task) => task.spaceId === space.id).length}
            onToggle={toggleSpace}
            onDelete={deleteSpace}
            onColorChange={changeSpaceColor}
          />
        ))}
      </div>

      <CreateSpaceForm onCreate={createSpace} />
      <ApplyTemplateMenu onApply={applyTemplate} />
    </div>
  );
}
