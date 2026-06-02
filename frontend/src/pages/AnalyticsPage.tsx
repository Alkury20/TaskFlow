import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStats } from "@/features/stats/api";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { Stats } from "@/types";

const colors = ["#6366f1", "#06b6d4", "#f97316", "#22c55e"];

export function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetchStats().then(setStats);
  }, []);

  if (!stats) {
    return <Skeleton className="h-[60vh]" />;
  }

  const statusData = Object.entries(stats.by_status).map(([key, value]) => ({ name: statusLabels[key as keyof typeof statusLabels], value }));
  const priorityData = Object.entries(stats.by_priority).map(([key, value]) => ({ name: priorityLabels[key as keyof typeof priorityLabels], value }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="mb-6 text-xl font-black">Выполнено за неделю</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.weekly_completed}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <h2 className="mb-6 text-xl font-black">Задачи по статусам</h2>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} label>
              {statusData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card className="xl:col-span-2">
        <h2 className="mb-6 text-xl font-black">Распределение по приоритетам</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {priorityData.map((item, index) => (
            <div key={item.name} className="rounded-2xl bg-muted/60 p-4">
              <div className="h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <p className="mt-4 text-sm text-slate-500">{item.name}</p>
              <p className="text-2xl font-black">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
