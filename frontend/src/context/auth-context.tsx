"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, setToken, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<{ user: User; telegramGroupUrl?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  country?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>("/api/auth/me");
      setUser(data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session check on mount
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    const data = await api.post<{ token: string; user: User }>("/api/auth/login", { email, password, rememberMe }, { auth: false });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await api.post<{ token: string; user: User; telegramGroupUrl?: string }>("/api/auth/register", payload, { auth: false });
    setToken(data.token);
    setUser(data.user);
    return { user: data.user, telegramGroupUrl: data.telegramGroupUrl };
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
