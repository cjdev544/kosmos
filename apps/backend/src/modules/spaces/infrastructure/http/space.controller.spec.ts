import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { SpaceController } from "./space.controller.js";
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
import type { AuthenticatedRequest } from "../../../../shared/infrastructure/http/auth.middleware.js";
import type { Response } from "express";

function buildResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

function buildController(overrides: {
  createSpaceUseCase?: Partial<CreateSpaceUseCase>;
  listSpacesUseCase?: Partial<ListSpacesUseCase>;
  toggleSpaceUseCase?: Partial<ToggleSpaceUseCase>;
  changeSpaceViewUseCase?: Partial<ChangeSpaceViewUseCase>;
  changeSpaceColorUseCase?: Partial<ChangeSpaceColorUseCase>;
  applyTemplateUseCase?: Partial<ApplyTemplateUseCase>;
  listTemplatesUseCase?: Partial<ListTemplatesUseCase>;
  deleteSpaceUseCase?: Partial<DeleteSpaceUseCase>;
} = {}): SpaceController {
  return new SpaceController(
    { execute: vi.fn(), ...overrides.createSpaceUseCase } as CreateSpaceUseCase,
    { execute: vi.fn(), ...overrides.listSpacesUseCase } as ListSpacesUseCase,
    { execute: vi.fn(), ...overrides.toggleSpaceUseCase } as ToggleSpaceUseCase,
    { execute: vi.fn(), ...overrides.changeSpaceViewUseCase } as ChangeSpaceViewUseCase,
    { execute: vi.fn(), ...overrides.changeSpaceColorUseCase } as ChangeSpaceColorUseCase,
    { execute: vi.fn(), ...overrides.applyTemplateUseCase } as ApplyTemplateUseCase,
    { execute: vi.fn(), ...overrides.listTemplatesUseCase } as ListTemplatesUseCase,
    { execute: vi.fn(), ...overrides.deleteSpaceUseCase } as DeleteSpaceUseCase,
  );
}

describe("SpaceController", () => {
  describe("create", () => {
    it("creates a space for the authenticated user", async () => {
      const createSpaceUseCase = { execute: vi.fn().mockResolvedValue({ id: "space-1" }) };
      const controller = buildController({ createSpaceUseCase });
      const req = { userId: "user-1", body: { name: "Trabajo" } } as AuthenticatedRequest;
      const res = buildResponse();

      await controller.create(req, res);

      expect(createSpaceUseCase.execute).toHaveBeenCalledWith({ ownerId: "user-1", name: "Trabajo" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: "space-1" });
    });

    it("throws UnauthorizedError when there is no authenticated user", async () => {
      const controller = buildController();
      const req = { body: { name: "Trabajo" } } as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.create(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it("throws a ZodError for an invalid body", async () => {
      const controller = buildController();
      const req = { userId: "user-1", body: { name: "" } } as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.create(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe("list", () => {
    it("lists spaces for the authenticated user", async () => {
      const listSpacesUseCase = { execute: vi.fn().mockResolvedValue([{ id: "space-1" }]) };
      const controller = buildController({ listSpacesUseCase });
      const req = { userId: "user-1" } as AuthenticatedRequest;
      const res = buildResponse();

      await controller.list(req, res);

      expect(listSpacesUseCase.execute).toHaveBeenCalledWith("user-1");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("throws UnauthorizedError when there is no authenticated user", async () => {
      const controller = buildController();
      const req = {} as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.list(req, res)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("toggle", () => {
    it("toggles the space identified by the route param", async () => {
      const toggleSpaceUseCase = { execute: vi.fn().mockResolvedValue({ id: "space-1", isActive: false }) };
      const controller = buildController({ toggleSpaceUseCase });
      const req = { userId: "user-1", params: { id: "space-1" } } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.toggle(req, res);

      expect(toggleSpaceUseCase.execute).toHaveBeenCalledWith({ ownerId: "user-1", spaceId: "space-1" });
    });
  });

  describe("changeView", () => {
    it("changes the space view type", async () => {
      const changeSpaceViewUseCase = { execute: vi.fn().mockResolvedValue({ id: "space-1", viewType: "KANBAN" }) };
      const controller = buildController({ changeSpaceViewUseCase });
      const req = {
        userId: "user-1",
        params: { id: "space-1" },
        body: { viewType: "KANBAN" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.changeView(req, res);

      expect(changeSpaceViewUseCase.execute).toHaveBeenCalledWith({
        ownerId: "user-1",
        spaceId: "space-1",
        viewType: "KANBAN",
      });
    });

    it("throws a ZodError for an invalid viewType", async () => {
      const controller = buildController();
      const req = {
        userId: "user-1",
        params: { id: "space-1" },
        body: { viewType: "GRID" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.changeView(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe("changeColor", () => {
    it("changes the space color", async () => {
      const changeSpaceColorUseCase = { execute: vi.fn().mockResolvedValue({ id: "space-1", color: "#FFFFFF" }) };
      const controller = buildController({ changeSpaceColorUseCase });
      const req = {
        userId: "user-1",
        params: { id: "space-1" },
        body: { color: "#FFFFFF" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.changeColor(req, res);

      expect(changeSpaceColorUseCase.execute).toHaveBeenCalledWith({
        ownerId: "user-1",
        spaceId: "space-1",
        color: "#FFFFFF",
      });
    });
  });

  describe("listTemplates", () => {
    it("does not require authentication", async () => {
      const listTemplatesUseCase = { execute: vi.fn().mockResolvedValue([]) };
      const controller = buildController({ listTemplatesUseCase });
      const req = {} as AuthenticatedRequest;
      const res = buildResponse();

      await controller.listTemplates(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("applyTemplate", () => {
    it("applies the template identified by the route param", async () => {
      const applyTemplateUseCase = { execute: vi.fn().mockResolvedValue([{ id: "space-1" }]) };
      const controller = buildController({ applyTemplateUseCase });
      const req = { userId: "user-1", params: { templateId: "student" } } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.applyTemplate(req, res);

      expect(applyTemplateUseCase.execute).toHaveBeenCalledWith({ ownerId: "user-1", templateId: "student" });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("delete", () => {
    it("deletes the space and responds 204 with no body", async () => {
      const deleteSpaceUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
      const controller = buildController({ deleteSpaceUseCase });
      const req = { userId: "user-1", params: { id: "space-1" } } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.delete(req, res);

      expect(deleteSpaceUseCase.execute).toHaveBeenCalledWith({ ownerId: "user-1", spaceId: "space-1" });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith();
    });
  });
});
