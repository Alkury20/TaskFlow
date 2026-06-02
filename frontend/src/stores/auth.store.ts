import { create } from "zustand";

import { api } from "@/lib/axios";
import type { User } from "@/types";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

const storedUser = localStorage.getItem("taskflow_user");
const storedToken = localStorage.getItem("taskflow_token");

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  async login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("taskflow_token", data.access_token);
    localStorage.setItem("taskflow_user", JSON.stringify(data.user));
    set({ token: data.access_token, user: data.user, isAuthenticated: true });
  },
  async register(email, username, password) {
    const { data } = await api.post("/auth/register", { email, username, password });
    localStorage.setItem("taskflow_token", data.access_token);
    localStorage.setItem("taskflow_user", JSON.stringify(data.user));
    set({ token: data.access_token, user: data.user, isAuthenticated: true });
  },
  logout() {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    set({ token: null, user: null, isAuthenticated: false });
  },
  hydrate() {
    const token = localStorage.getItem("taskflow_token");
    const user = localStorage.getItem("taskflow_user");
    set({ token, user: user ? JSON.parse(user) : null, isAuthenticated: Boolean(token) });
  },
}));
