"use client";

import { useMemo, useState, useCallback } from "react";
import type { PlatformUser } from "@/types/user";

const USER_KEY = "adyapan-user";
const TOKEN_KEY = "adyapan-token";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function saveAuthSession(token: string, user: PlatformUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie(TOKEN_KEY, token);
  setCookie(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  deleteCookie(TOKEN_KEY);
  deleteCookie(USER_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<PlatformUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as PlatformUser;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      logout,
    }),
    [user, logout],
  );
}
