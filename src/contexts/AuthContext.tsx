import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import api from "@/services/api";

export type AppRole = "superadmin" | "admin" | "juri";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistSession = (nextToken: string | null, nextUser: AuthUser | null) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } else {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      persistSession(null, null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await api.get<{ user: AuthUser }>("/auth/me");
      persistSession(currentToken, response.data.user);
      return response.data.user;
    } catch {
      persistSession(null, null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await api.post<{ token: string; user: AuthUser }>("/auth/login", payload);
    persistSession(response.data.token, response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await api.post("/auth/logout");
      }
    } catch {
      // Ignore logout transport failures and clear local session anyway.
    } finally {
      persistSession(null, null);
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    refreshUser,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
