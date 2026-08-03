import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import type { AuthenticatedRequest } from "../../../../shared/infrastructure/http/auth.middleware.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type {
  ApplyTemplateUseCase,
  ChangeSpaceColorUseCase,
  ChangeSpaceViewUseCase,
  CreateSpaceUseCase,
  DeleteSpaceUseCase,
  ListSpacesUseCase,
  ListTemplatesUseCase,
  ToggleSpaceUseCase,
} from "../../domain/ports.js";
import { applyTemplateParamsSchema, changeSpaceColorSchema, changeSpaceViewSchema, createSpaceSchema } from "./space.schemas.js";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.userId) {
    throw new UnauthorizedError("Se requiere autenticación");
  }
  return req.userId;
}

@injectable()
export class SpaceController {
  constructor(
    @inject(DI_TOKENS.CreateSpaceUseCase) private readonly createSpaceUseCase: CreateSpaceUseCase,
    @inject(DI_TOKENS.ListSpacesUseCase) private readonly listSpacesUseCase: ListSpacesUseCase,
    @inject(DI_TOKENS.ToggleSpaceUseCase) private readonly toggleSpaceUseCase: ToggleSpaceUseCase,
    @inject(DI_TOKENS.ChangeSpaceViewUseCase) private readonly changeSpaceViewUseCase: ChangeSpaceViewUseCase,
    @inject(DI_TOKENS.ChangeSpaceColorUseCase) private readonly changeSpaceColorUseCase: ChangeSpaceColorUseCase,
    @inject(DI_TOKENS.ApplyTemplateUseCase) private readonly applyTemplateUseCase: ApplyTemplateUseCase,
    @inject(DI_TOKENS.ListTemplatesUseCase) private readonly listTemplatesUseCase: ListTemplatesUseCase,
    @inject(DI_TOKENS.DeleteSpaceUseCase) private readonly deleteSpaceUseCase: DeleteSpaceUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    const dto = createSpaceSchema.parse(req.body);
    const space = await this.createSpaceUseCase.execute({ ownerId, ...dto });
    res.status(201).json(space);
  };

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    const spaces = await this.listSpacesUseCase.execute(ownerId);
    res.status(200).json(spaces);
  };

  toggle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    const space = await this.toggleSpaceUseCase.execute({ ownerId, spaceId: req.params.id! });
    res.status(200).json(space);
  };

  changeView = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    const dto = changeSpaceViewSchema.parse(req.body);
    const space = await this.changeSpaceViewUseCase.execute({
      ownerId,
      spaceId: req.params.id!,
      viewType: dto.viewType,
    });
    res.status(200).json(space);
  };

  changeColor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    const dto = changeSpaceColorSchema.parse(req.body);
    const space = await this.changeSpaceColorUseCase.execute({
      ownerId,
      spaceId: req.params.id!,
      color: dto.color,
    });
    res.status(200).json(space);
  };

  listTemplates = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const templates = await this.listTemplatesUseCase.execute();
    res.status(200).json(templates);
  };

  applyTemplate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    const { templateId } = applyTemplateParamsSchema.parse(req.params);
    const spaces = await this.applyTemplateUseCase.execute({ ownerId, templateId });
    res.status(201).json(spaces);
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ownerId = requireUserId(req);
    await this.deleteSpaceUseCase.execute({ ownerId, spaceId: req.params.id! });
    res.status(204).send();
  };
}
