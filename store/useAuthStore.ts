import { create } from "zustand";
import { User } from "firebase/auth";

type AuthState = {
  user: User | null;
  isAuthLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (val: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true,

  setUser: (user: any) => set({ user }),
  setLoading: (val: boolean) => set({ isAuthLoading: val }),
}));
