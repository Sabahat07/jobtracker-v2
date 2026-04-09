import { create } from "zustand";
import { User } from "../types";
import api from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem("token");
    if (!token) { set({ isLoading: false }); return; }
    try {
      const { data } = await api.get<{ user: User }>("/auth/me");
      set({ user: data.user, token, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
  },

  register: async (name, email, password) => {
    const { data } = await api.post<{ token: string; user: User }>("/auth/register", { name, email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
