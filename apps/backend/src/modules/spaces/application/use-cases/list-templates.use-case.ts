import { injectable } from "tsyringe";
import { SPACE_TEMPLATES, SpaceTemplate } from "../../domain/space-templates.js";
import type { ListTemplatesUseCase as ListTemplatesUseCasePort } from "../../domain/ports.js";

@injectable()
export class ListTemplatesUseCase implements ListTemplatesUseCasePort {
  async execute(): Promise<SpaceTemplate[]> {
    return SPACE_TEMPLATES;
  }
}
