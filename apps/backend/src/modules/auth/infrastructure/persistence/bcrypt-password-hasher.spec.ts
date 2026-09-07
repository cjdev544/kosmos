import { describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher.js";

describe("BcryptPasswordHasher", () => {
  it("hashes a password into something different from the plain text", async () => {
    const hasher = new BcryptPasswordHasher();

    const hash = await hasher.hash("secret123");

    expect(hash).not.toBe("secret123");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("compare returns true for the correct password", async () => {
    const hasher = new BcryptPasswordHasher();
    const hash = await hasher.hash("secret123");

    expect(await hasher.compare("secret123", hash)).toBe(true);
  });

  it("compare returns false for an incorrect password", async () => {
    const hasher = new BcryptPasswordHasher();
    const hash = await hasher.hash("secret123");

    expect(await hasher.compare("wrong-password", hash)).toBe(false);
  });
});
