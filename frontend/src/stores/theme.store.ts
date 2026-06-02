import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggleTheme: () => void;
  applyTheme: () => void;
};

const initialTheme = (localStorage.getItem("taskflow_theme") as Theme | null) ?? "light";

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggleTheme() {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("taskflow_theme", next);
    set({ theme: next });
    document.documentElement.classList.toggle("dark", next === "dark");
  },
  applyTheme() {
    document.documentElement.classList.toggle("dark", get().theme === "dark");
  },
}));
