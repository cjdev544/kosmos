import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickAddTask } from "./quick-add-task";

describe("QuickAddTask", () => {
  it("submits the title with the default priority and no due date", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuickAddTask onCreate={onCreate} />);

    await user.type(screen.getByPlaceholderText("Nueva tarea..."), "Comprar leche");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onCreate).toHaveBeenCalledWith({ title: "Comprar leche", priority: "MEDIUM", dueDate: undefined });
  });

  it("does not submit when the title is blank", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<QuickAddTask onCreate={onCreate} />);

    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("clears the form after a successful submit", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuickAddTask onCreate={onCreate} />);
    const titleInput = screen.getByPlaceholderText("Nueva tarea...") as HTMLInputElement;

    await user.type(titleInput, "Comprar leche");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(titleInput.value).toBe("");
  });

  it("only reveals the time input once a date is chosen", async () => {
    const user = userEvent.setup();
    render(<QuickAddTask onCreate={vi.fn()} />);

    expect(screen.queryByLabelText("Hora (opcional)")).not.toBeInTheDocument();

    await user.type(document.querySelector('input[type="date"]')!, "2026-03-15");

    expect(screen.getByLabelText("Hora (opcional)")).toBeInTheDocument();
  });

  it("combines date and time into an ISO due date when both are set", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuickAddTask onCreate={onCreate} />);

    await user.type(screen.getByPlaceholderText("Nueva tarea..."), "Comprar leche");
    await user.type(document.querySelector('input[type="date"]')!, "2026-03-15");
    await user.type(document.querySelector('input[type="time"]')!, "14:30");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Comprar leche", dueDate: new Date("2026-03-15T14:30:00").toISOString() }),
    );
  });

  it("lets the user change the priority", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuickAddTask onCreate={onCreate} />);

    await user.type(screen.getByPlaceholderText("Nueva tarea..."), "Comprar leche");
    await user.selectOptions(screen.getByLabelText("Prioridad"), "HIGH");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ priority: "HIGH" }));
  });
});
