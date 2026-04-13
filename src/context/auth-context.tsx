import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User, LoginRequest, RegisterRequest } from "../types";
import {
  authApi,
  storeTokens,
  clearTokens,
  getStoredTokens,
  storeUser,
  getStoredUser,
} from "../lib/api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const isAuthenticated = useMemo(
    () => user !== null && getStoredTokens() !== null,
    [user]
  );

  const login = useCallback(async (data: LoginRequest) => {
    const auth = await authApi.login(data);
    storeTokens({ token: auth.token });
    const loggedUser: User = {
      ...auth.user,
      created_at: new Date().toISOString(),
    };
    storeUser(loggedUser);
    setUser(loggedUser);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const auth = await authApi.register(data);
    return { ...auth.user, created_at: new Date().toISOString() };
  }, []);

  const logout = useCallback(async () => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, register, logout }),
    [user, isAuthenticated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
