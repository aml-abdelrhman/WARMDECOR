import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import {
  TOKEN_COOKIE_KEY,
  USER_COOKIE_KEY,
  COOKIE_EXPIRES_DAYS,
} from "@/constants/app";
import type { AuthUser, Nullable } from "@/types";

interface AuthState {
  user: Nullable<AuthUser>;
  token: Nullable<string>;

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        Cookies.set(TOKEN_COOKIE_KEY, token, {
          expires: COOKIE_EXPIRES_DAYS,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        Cookies.set(USER_COOKIE_KEY, JSON.stringify(user), {
          expires: COOKIE_EXPIRES_DAYS,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        set({ user, token });
      },

      clearAuth: () => {
        Cookies.remove(TOKEN_COOKIE_KEY);
        Cookies.remove(USER_COOKIE_KEY);

        set({ user: null, token: null });
      },

      updateUser: (partial) => {
        const current = get().user;
        if (!current) return;

        set({
          user: { ...current, ...partial },
        });
      },
    }),
    {
      name: "ec-auth",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);