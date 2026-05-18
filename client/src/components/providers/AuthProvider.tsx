"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getStoredUser, getToken } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
