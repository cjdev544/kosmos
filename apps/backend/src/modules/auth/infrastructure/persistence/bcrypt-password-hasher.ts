import bcrypt from "bcryptjs";
import { injectable } from "tsyringe";
import type { PasswordHasher } from "../../domain/ports.js";

const SALT_ROUNDS = 10;

@injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
