import { User } from "./user.entity.js";

/** Output port: persistence for users. Implemented by an infrastructure adapter. */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

/** Output port: password hashing. Implemented by a bcrypt adapter. */
export interface PasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Output port: token issuing/verification. Implemented by a JWT adapter. */
export interface TokenService {
  generateTokenPair(userId: string): TokenPair;
  verifyRefreshToken(token: string): { sub: string };
}

export interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface AuthResult {
  user: ReturnType<User["toPublic"]>;
  tokens: TokenPair;
}

/** Input port: use case interface implemented by the application layer. */
export interface RegisterUserUseCase {
  execute(input: RegisterUserInput): Promise<AuthResult>;
}

/** Input port: use case interface implemented by the application layer. */
export interface LoginUserUseCase {
  execute(input: LoginUserInput): Promise<AuthResult>;
}

/** Input port: use case interface implemented by the application layer. */
export interface RefreshTokenUseCase {
  execute(input: RefreshTokenInput): Promise<AuthResult>;
}
