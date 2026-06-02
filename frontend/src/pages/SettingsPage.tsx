import { useEffect, useState } from "react";
import { LogOut, Moon, Send, Sun } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchTelegramStatus, regenerateTelegramLinkCode, unlinkTelegram } from "@/features/telegram/api";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import type { TelegramStatus } from "@/types";

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [telegram, setTelegram] = useState<TelegramStatus | null>(null);

  useEffect(() => {
    void fetchTelegramStatus().then(setTelegram);
  }, []);

  async function refreshCode() {
    try {
      setTelegram(await regenerateTelegramLinkCode());
      toast.success("Код Telegram обновлен");
    } catch {
      toast.error("Не удалось обновить код Telegram");
    }
  }

  async function disconnectTelegram() {
    try {
      setTelegram(await unlinkTelegram());
      toast.success("Telegram отключен");
    } catch {
      toast.error("Не удалось отключить Telegram");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-black">Профиль</h2>
        <div className="mt-6 rounded-2xl bg-muted/60 p-4">
          <p className="font-bold">{user?.username}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Настройки рабочего пространства</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "dark" ? "Светлая тема" : "Темная тема"}
          </Button>
          <Button variant="danger" onClick={logout}>
            <LogOut size={18} />
            Выйти
          </Button>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Telegram-уведомления</h2>
            <p className="mt-2 text-sm text-slate-500">
              Привяжите Telegram, чтобы получать напоминания о дедлайнах и изменениях статусов задач.
            </p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Send size={22} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-muted/60 p-4">
          {!telegram ? (
            <p className="text-sm text-slate-500">Загрузка настроек Telegram...</p>
          ) : !telegram.enabled ? (
            <p className="text-sm text-slate-500">
              Telegram-бот не настроен. Добавьте токен в переменную `TELEGRAM_BOT_TOKEN` на backend.
            </p>
          ) : telegram.connected ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">Telegram подключен</p>
                <p className="text-sm text-slate-500">Напоминания будут приходить в привязанный чат.</p>
              </div>
              <Button variant="danger" onClick={() => void disconnectTelegram()}>
                Отключить Telegram
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-bold">Код привязки</p>
                <p className="mt-2 rounded-2xl bg-card px-4 py-3 font-mono text-lg">{telegram.link_code}</p>
              </div>
              <p className="text-sm text-slate-500">
                Откройте вашего Telegram-бота и отправьте команду: <span className="font-mono">/start {telegram.link_code}</span>
              </p>
              <Button variant="secondary" onClick={() => void refreshCode()}>
                Сгенерировать новый код
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
