import { describe, expect, it } from "vitest";
import { calendarDateKey, combineDateAndTime, formatDate, formatTime, formatTimeInput, hasExplicitTime } from "./date-utils";

describe("hasExplicitTime", () => {
  it("returns false for a date at UTC midnight", () => {
    expect(hasExplicitTime("2026-03-15T00:00:00.000Z")).toBe(false);
  });

  it("returns true when a time component is present", () => {
    expect(hasExplicitTime("2026-03-15T14:30:00.000Z")).toBe(true);
  });
});

describe("combineDateAndTime", () => {
  it("combines a date and a time into an ISO string", () => {
    const result = combineDateAndTime("2026-03-15", "14:30");

    expect(new Date(result).toISOString()).toBe(new Date("2026-03-15T14:30:00").toISOString());
  });
});

describe("formatTime", () => {
  it("formats the time portion in es-ES 24h style", () => {
    expect(formatTime("2026-03-15T14:30:00.000Z")).toBe("14:30");
  });
});

describe("formatTimeInput", () => {
  it("formats hours and minutes zero-padded for an <input type=time>", () => {
    expect(formatTimeInput("2026-03-15T09:05:00.000Z")).toBe("09:05");
  });
});

describe("calendarDateKey", () => {
  it("returns the date slice directly when there is no explicit time", () => {
    expect(calendarDateKey("2026-03-15T00:00:00.000Z")).toBe("2026-03-15");
  });

  it("derives the local date key when a time is present", () => {
    expect(calendarDateKey("2026-03-15T14:30:00.000Z")).toBe("2026-03-15");
  });
});

describe("formatDate", () => {
  it("formats a due date in es-ES short style", () => {
    expect(formatDate("2026-03-15T00:00:00.000Z")).toBe(new Date(2026, 2, 15).toLocaleDateString("es-ES", { day: "numeric", month: "short" }));
  });
});
