"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type State = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<State>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "streamflix-auth" }
  )
);
