import { ForbiddenError, NotFoundError } from "../../../shared/domain/errors.js";
import type { SpaceRepository } from "../../spaces/domain/ports.js";

export async function assertSpaceOwnership(
  spaceRepository: SpaceRepository,
  spaceId: string,
  requesterId: string,
): Promise<void> {
  const space = await spaceRepository.findById(spaceId);
  if (!space) {
    throw new NotFoundError("Espacio no encontrado");
  }
  if (space.ownerId !== requesterId) {
    throw new ForbiddenError("No eres propietario de este espacio");
  }
}
