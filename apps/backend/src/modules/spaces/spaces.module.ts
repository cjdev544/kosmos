import { container } from "tsyringe";
import { DI_TOKENS } from "../../shared/infrastructure/di/tokens.js";
import { CreateSpaceUseCase } from "./application/use-cases/create-space.use-case.js";
import { ListSpacesUseCase } from "./application/use-cases/list-spaces.use-case.js";
import { ToggleSpaceUseCase } from "./application/use-cases/toggle-space.use-case.js";
import { ChangeSpaceViewUseCase } from "./application/use-cases/change-space-view.use-case.js";
import { ChangeSpaceColorUseCase } from "./application/use-cases/change-space-color.use-case.js";
import { ApplyTemplateUseCase } from "./application/use-cases/apply-template.use-case.js";
import { ListTemplatesUseCase } from "./application/use-cases/list-templates.use-case.js";
import { DeleteSpaceUseCase } from "./application/use-cases/delete-space.use-case.js";
import { PrismaSpaceRepository } from "./infrastructure/persistence/prisma-space.repository.js";

export function registerSpacesModule(): void {
  container.registerSingleton(DI_TOKENS.SpaceRepository, PrismaSpaceRepository);
  container.registerSingleton(DI_TOKENS.CreateSpaceUseCase, CreateSpaceUseCase);
  container.registerSingleton(DI_TOKENS.ListSpacesUseCase, ListSpacesUseCase);
  container.registerSingleton(DI_TOKENS.ToggleSpaceUseCase, ToggleSpaceUseCase);
  container.registerSingleton(DI_TOKENS.ChangeSpaceViewUseCase, ChangeSpaceViewUseCase);
  container.registerSingleton(DI_TOKENS.ChangeSpaceColorUseCase, ChangeSpaceColorUseCase);
  container.registerSingleton(DI_TOKENS.ApplyTemplateUseCase, ApplyTemplateUseCase);
  container.registerSingleton(DI_TOKENS.ListTemplatesUseCase, ListTemplatesUseCase);
  container.registerSingleton(DI_TOKENS.DeleteSpaceUseCase, DeleteSpaceUseCase);
}
