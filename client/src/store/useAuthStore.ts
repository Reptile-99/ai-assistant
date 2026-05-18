import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/auth";
import { setToken, removeToken, setStoredUser, getToken, getStoredUser } from "@/lib/auth";
import api from "@/services/api.client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        setToken(token);
        setStoredUser(user);
        // Set cookie for middleware (Next.js middleware uses cookies)
        document.cookie = `study_assistant_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        set({ user, token, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error", error);
        } finally {
          removeToken();
          document.cookie = "study_assistant_token=; path=/; max-age=0";
          set({ user: null, token: null, isAuthenticated: false });
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      checkAuth: async () => {
        const token = getToken();
        const user = getStoredUser();

        if (token && user) {
          set({ token, user, isAuthenticated: true });
          
          try {
            // Verify session with backend
            const response = await api.get("/auth/me");
            if (response.data.success) {
              set({ user: response.data.data, isAuthenticated: true });
              setStoredUser(response.data.data);
            }
          } catch (error) {
            console.error("Auth check failed", error);
            // If token is invalid or expired, the interceptor will try to refresh it
            // If refresh fails, interceptor will redirect to login and clear tokens
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
