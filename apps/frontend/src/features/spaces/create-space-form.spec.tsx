import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateSpaceForm } from "./create-space-form";

describe("CreateSpaceForm", () => {
  it("starts collapsed, showing only the trigger button", () => {
    render(<CreateSpaceForm onCreate={vi.fn()} />);

    expect(screen.getByRole("button", { name: "+ Nuevo espacio" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Nombre del espacio")).not.toBeInTheDocument();
  });

  it("expands the form when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateSpaceForm onCreate={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "+ Nuevo espacio" }));

    expect(screen.getByPlaceholderText("Nombre del espacio")).toBeInTheDocument();
  });

  it("submits the name and icon, then resets and collapses", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreateSpaceForm onCreate={onCreate} />);
    await user.click(screen.getByRole("button", { name: "+ Nuevo espacio" }));

    await user.type(screen.getByPlaceholderText("Nombre del espacio"), "Trabajo");
    await user.type(screen.getByPlaceholderText("Emoji (opcional)"), "💼");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(onCreate).toHaveBeenCalledWith({ name: "Trabajo", icon: "💼", color: "#6366f1" });
    expect(await screen.findByRole("button", { name: "+ Nuevo espacio" })).toBeInTheDocument();
  });

  it("does not submit when the name is blank", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateSpaceForm onCreate={onCreate} />);
    await user.click(screen.getByRole("button", { name: "+ Nuevo espacio" }));

    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("cancel collapses the form without submitting", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateSpaceForm onCreate={onCreate} />);
    await user.click(screen.getByRole("button", { name: "+ Nuevo espacio" }));
    await user.type(screen.getByPlaceholderText("Nombre del espacio"), "Trabajo");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "+ Nuevo espacio" })).toBeInTheDocument();
  });
});
