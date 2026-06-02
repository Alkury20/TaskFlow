import { motion } from "framer-motion";

import { TaskCard } from "@/components/tasks/TaskCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statusLabels } from "@/lib/constants";
import { useTasks } from "@/hooks/useTasks";
import type { TaskStatus } from "@/types";

const statuses = Object.keys(statusLabels) as TaskStatus[];

export function KanbanPage() {
  const { tasks, loading, reload } = useTasks();

  if (loading) {
    return <Skeleton className="h-[60vh]" />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {statuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <Card key={status} className="min-h-[420px] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black">{statusLabels[status]}</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">{columnTasks.length}</span>
            </div>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <TaskCard task={task} onChanged={reload} />
                </motion.div>
              ))}
              {!columnTasks.length && <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">Колонка пуста</p>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
