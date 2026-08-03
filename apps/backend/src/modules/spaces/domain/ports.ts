import { Space, SpaceProps } from "./space.entity.js";
import { SpaceViewType } from "./space-view-type.vo.js";
import { SpaceTemplate } from "./space-templates.js";

/** Output port: persistence for spaces. */
export interface SpaceRepository {
  findById(id: string): Promise<Space | null>;
  findAllByOwner(ownerId: string): Promise<Space[]>;
  save(space: Space): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CreateSpaceInput {
  ownerId: string;
  name: string;
  icon?: string;
  color?: string;
  viewType?: SpaceViewType;
}

export interface ToggleSpaceInput {
  ownerId: string;
  spaceId: string;
}

export interface ChangeSpaceViewInput {
  ownerId: string;
  spaceId: string;
  viewType: SpaceViewType;
}

export interface ApplyTemplateInput {
  ownerId: string;
  templateId: string;
}

export interface ChangeSpaceColorInput {
  ownerId: string;
  spaceId: string;
  color: string | null;
}

export interface DeleteSpaceInput {
  ownerId: string;
  spaceId: string;
}

/** Input port: implemented by CreateSpaceUseCase. */
export interface CreateSpaceUseCase {
  execute(input: CreateSpaceInput): Promise<SpaceProps>;
}

/** Input port: implemented by ListSpacesUseCase. */
export interface ListSpacesUseCase {
  execute(ownerId: string): Promise<SpaceProps[]>;
}

/** Input port: implemented by ToggleSpaceUseCase. */
export interface ToggleSpaceUseCase {
  execute(input: ToggleSpaceInput): Promise<SpaceProps>;
}

/** Input port: implemented by ChangeSpaceViewUseCase. */
export interface ChangeSpaceViewUseCase {
  execute(input: ChangeSpaceViewInput): Promise<SpaceProps>;
}

/** Input port: implemented by ApplyTemplateUseCase. */
export interface ApplyTemplateUseCase {
  execute(input: ApplyTemplateInput): Promise<SpaceProps[]>;
}

/** Input port: implemented by ListTemplatesUseCase. */
export interface ListTemplatesUseCase {
  execute(): Promise<SpaceTemplate[]>;
}

/** Input port: implemented by ChangeSpaceColorUseCase. */
export interface ChangeSpaceColorUseCase {
  execute(input: ChangeSpaceColorInput): Promise<SpaceProps>;
}

/** Input port: implemented by DeleteSpaceUseCase. */
export interface DeleteSpaceUseCase {
  execute(input: DeleteSpaceInput): Promise<void>;
}
