import { httpClient } from "../../shared/lib/http-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export function register(input: { email: string; password: string; name: string }): Promise<AuthResult> {
  return httpClient.post<AuthResult>("/auth/register", input);
}

export function login(input: { email: string; password: string }): Promise<AuthResult> {
  return httpClient.post<AuthResult>("/auth/login", input);
}
