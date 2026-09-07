import { describe, expect, it } from "vitest";
import { User } from "./user.entity.js";
import { ValidationError } from "../../../shared/domain/errors.js";

const validProps = {
  id: "user-1",
  email: "user@example.com",
  passwordHash: "hashed",
  name: "Test User",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("User", () => {
  it("creates a user with valid props", () => {
    const user = User.create(validProps);

    expect(user.id).toBe("user-1");
    expect(user.email).toBe("user@example.com");
    expect(user.name).toBe("Test User");
  });

  it("throws ValidationError when email has no @", () => {
    expect(() => User.create({ ...validProps, email: "invalid-email" })).toThrow(ValidationError);
  });

  it("throws ValidationError when name is empty", () => {
    expect(() => User.create({ ...validProps, name: "" })).toThrow(ValidationError);
  });

  it("throws ValidationError when name is only whitespace", () => {
    expect(() => User.create({ ...validProps, name: "   " })).toThrow(ValidationError);
  });

  it("exposes a public representation without the password hash", () => {
    const user = User.create(validProps);

    expect(user.toPublic()).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      createdAt: validProps.createdAt,
    });
  });
});
