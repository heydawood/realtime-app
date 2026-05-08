import { create } from "zustand";
import { User } from "firebase/auth";

type AuthState = {
  user: User | null;
  isAuthLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (val: boolean) => void;
};

interface CallStoreState {
  usersInCall: Set<string>;
  setUsersInCall: (users: Set<string>) => void;
}



export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true,

  setUser: (user: any) => set({ user }),
  setLoading: (val: boolean) => set({ isAuthLoading: val }),
}));



export const useCallStore = create<CallStoreState>((set) => ({
  usersInCall: new Set(),
  setUsersInCall: (users) => set({ usersInCall: users }),
}));
