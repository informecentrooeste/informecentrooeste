import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  useAuthLogin, 
  useAuthMe, 
  useAuthLogout,
  type LoginRequest,
  type AuthResponse,
  type UserProfile
} from "@workspace/api-client-react";

const TOKEN_KEY = "informe_access_token";
const REFRESH_KEY = "informe_refresh_token";

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAuth() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const token = localStorage.getItem(TOKEN_KEY);

  const { data: user, isLoading, error } = useAuthMe({
    query: {
      enabled: !!token,
      retry: false,
    },
    request: { headers: getAuthHeaders() }
  });

  const loginMutation = useAuthLogin({
    mutation: {
      onSuccess: (data: AuthResponse) => {
        setTokens(data.accessToken, data.refreshToken);
        queryClient.setQueryData(["/api/auth/me"], data.user);
        setLocation("/admin/dashboard");
      }
    }
  });

  const logoutMutation = useAuthLogout({
    mutation: {
      onSettled: () => {
        clearTokens();
        queryClient.clear();
        setLocation("/admin/login");
      }
    },
    request: { headers: getAuthHeaders() }
  });

  return {
    user,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    error
  };
}
