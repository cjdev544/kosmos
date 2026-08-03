import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { clearTokens, getStoredUser, isAuthenticated, setStoredUser, setTokens } from "../../shared/lib/auth-storage";
import * as authApi from "./api";
import type { AuthResult, AuthUser } from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAuthResult(result: AuthResult, setUser: (user: AuthUser) => void): void {
  setTokens(result.tokens.accessToken, result.tokens.refreshToken);
  setStoredUser(result.user);
  setUser(result.user);
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser<AuthUser>());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authenticated,
      login: async (email, password) => {
        const result = await authApi.login({ email, password });
        persistAuthResult(result, setUser);
        setAuthenticated(true);
      },
      register: async (email, password, name) => {
        const result = await authApi.register({ email, password, name });
        persistAuthResult(result, setUser);
        setAuthenticated(true);
      },
      logout: () => {
        clearTokens();
        setUser(null);
        setAuthenticated(false);
      },
    }),
    [user, authenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
