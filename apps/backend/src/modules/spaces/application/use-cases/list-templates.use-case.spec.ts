import { describe, expect, it } from "vitest";
import { ListTemplatesUseCase } from "./list-templates.use-case.js";
import { SPACE_TEMPLATES } from "../../domain/space-templates.js";

describe("ListTemplatesUseCase", () => {
  it("returns every declared space template", async () => {
    const useCase = new ListTemplatesUseCase();

    const result = await useCase.execute();

    expect(result).toEqual(SPACE_TEMPLATES);
  });
});
