import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplyTemplateMenu } from "./apply-template-menu";
import * as useSpaceTemplatesModule from "./use-space-templates";

vi.mock("./use-space-templates");

describe("ApplyTemplateMenu", () => {
  it("renders nothing while there are no templates", () => {
    vi.mocked(useSpaceTemplatesModule.useSpaceTemplates).mockReturnValue([]);

    const { container } = render(<ApplyTemplateMenu onApply={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders one button per template", () => {
    vi.mocked(useSpaceTemplatesModule.useSpaceTemplates).mockReturnValue([
      { id: "student", label: "Plantilla para Estudiantes" },
      { id: "freelancer", label: "Plantilla para Freelancers" },
    ]);

    render(<ApplyTemplateMenu onApply={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Plantilla para Estudiantes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plantilla para Freelancers" })).toBeInTheDocument();
  });

  it("calls onApply with the clicked template's id", async () => {
    vi.mocked(useSpaceTemplatesModule.useSpaceTemplates).mockReturnValue([
      { id: "student", label: "Plantilla para Estudiantes" },
    ]);
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<ApplyTemplateMenu onApply={onApply} />);

    await user.click(screen.getByRole("button", { name: "Plantilla para Estudiantes" }));

    expect(onApply).toHaveBeenCalledWith("student");
  });
});
