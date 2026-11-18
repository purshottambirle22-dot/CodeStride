import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { LoginResponse, User } from "../types";
import { getStoredTokens, setStoredTokens } from "../api/client";
import { getMyProfile } from "../api/user";
import { logoutUser } from "../api/auth";

interface AuthContextType {
  user: User | null;
  tokens: LoginResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (tokens: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<LoginResponse | null>(() => getStoredTokens());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (tokenOverride?: string) => {
    const activeToken = tokenOverride ?? tokens?.accessToken;
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      const profile = await getMyProfile(activeToken);
      setUser(profile);
    } catch (err) {
      console.warn("Failed to fetch user profile:", err);
      // If profile fails and token expired, clear tokens
      setStoredTokens(null);
      setTokens(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [tokens?.accessToken]);

  useEffect(() => {
    if (tokens?.accessToken) {
      void fetchProfile();
    } else {
      setLoading(false);
    }

    const handleForceLogout = () => {
      setTokens(null);
      setUser(null);
    };

    const handleTokensRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<LoginResponse>;
      if (customEvent.detail) {
        setTokens(customEvent.detail);
      }
    };

    window.addEventListener("auth:logout", handleForceLogout);
    window.addEventListener("auth:tokens_refreshed", handleTokensRefreshed);
    return () => {
      window.removeEventListener("auth:logout", handleForceLogout);
      window.removeEventListener("auth:tokens_refreshed", handleTokensRefreshed);
    };
  }, [tokens?.accessToken, fetchProfile]);

  const login = async (newTokens: LoginResponse) => {
    setLoading(true);
    setStoredTokens(newTokens);
    setTokens(newTokens);
    try {
      const profile = await getMyProfile(newTokens.accessToken);
      setUser(profile);
    } catch (err) {
      console.error("Profile load failed after login:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (tokens?.refreshToken) {
      try {
        await logoutUser(tokens.refreshToken);
      } catch {
        // Continue with local logout even if remote fails
      }
    }
    setStoredTokens(null);
    setTokens(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!tokens?.accessToken) return;
    try {
      const profile = await getMyProfile(tokens.accessToken);
      setUser(profile);
    } catch {
      // ignore
    }
  };

  const isAuthenticated = !!tokens && !!user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
