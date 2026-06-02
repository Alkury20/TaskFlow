import { useEffect, useState } from "react";
import { BarChart3, Bell, CheckCircle2, Clock3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStats } from "@/features/stats/api";
import { useNotificationsStore } from "@/stores/notifications.store";
import type { Stats } from "@/types";

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const notifications = useNotificationsStore((state) => state.notifications);
  const loadNotifications = useNotificationsStore((state) => state.load);
  const generateDeadlineReminders = useNotificationsStore((state) => state.generateDeadlineReminders);

  useEffect(() => {
    void fetchStats().then(setStats);
    void generateDeadlineReminders().catch(() => loadNotifications());
  }, [generateDeadlineReminders, loadNotifications]);

  if (!stats) {
    return <Skeleton className="h-[60vh]" />;
  }

  const cards = [
    { label: "Всего задач", value: stats.total_tasks, icon: BarChart3 },
    { label: "Завершено", value: stats.completed_tasks, icon: CheckCircle2 },
    { label: "Просрочено", value: stats.overdue_tasks, icon: Clock3 },
    { label: "Новых уведомлений", value: stats.unread_notifications, icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <item.icon />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-black">Прогресс</h2>
          <div className="mt-6 h-4 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${stats.completion_rate}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-500">Выполнено {stats.completion_rate}% задач</p>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Последние уведомления</h2>
          <div className="mt-4 space-y-3">
            {notifications.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl bg-muted/60 p-3">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-500">{item.message}</p>
              </div>
            ))}
            {!notifications.length && <p className="text-sm text-slate-500">Уведомлений пока нет.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
