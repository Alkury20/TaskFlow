import { BarChart3, Bell, CheckSquare, KanbanSquare, LayoutDashboard, LogOut, Moon, Settings, Sun } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";

const nav = [
  { to: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { to: "/tasks", label: "Задачи", icon: CheckSquare },
  { to: "/kanban", label: "Канбан", icon: KanbanSquare },
  { to: "/analytics", label: "Аналитика", icon: BarChart3 },
  { to: "/settings", label: "Настройки", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-20 border-b bg-card/80 p-4 backdrop-blur-xl lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:block">
          <div>
            <div className="text-2xl font-black tracking-tight">TaskFlow</div>
            <p className="text-sm text-slate-500">Современное пространство задач</p>
          </div>
          <Button className="lg:hidden" variant="ghost" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:bg-muted",
                  isActive && "bg-primary text-white shadow-soft hover:bg-primary",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 hidden rounded-2xl border bg-muted/50 p-4 lg:block">
          <div className="text-sm font-semibold">{user?.username}</div>
          <div className="truncate text-xs text-slate-500">{user?.email}</div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">С возвращением, {user?.username}</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Ваш центр продуктивности</h1>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="secondary">
              <Bell size={17} />
              Напоминания
            </Button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
