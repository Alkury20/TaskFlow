import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { priorityLabels, statusLabels } from "@/lib/constants";
import { useTaskFiltersStore } from "@/stores/taskFilters.store";
import { useTasks } from "@/hooks/useTasks";

export function TasksPage() {
  const { tasks, loading, reload } = useTasks();
  const filters = useTaskFiltersStore();

  return (
    <div className="space-y-6">
      <TaskForm onCreated={reload} />
      <Card className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={17} />
          <Input className="pl-11" placeholder="Поиск задач..." value={filters.search} onChange={(e) => filters.setSearch(e.target.value)} />
        </div>
        <Select value={filters.status ?? ""} onChange={(e) => filters.setStatus((e.target.value || undefined) as never)}>
          <option value="">Все статусы</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={filters.priority ?? ""} onChange={(e) => filters.setPriority((e.target.value || undefined) as never)}>
          <option value="">Все приоритеты</option>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={filters.sort} onChange={(e) => filters.setSort(e.target.value)}>
          <option value="created_desc">Сначала новые</option>
          <option value="created_asc">Сначала старые</option>
          <option value="deadline_asc">Дедлайн по возрастанию</option>
          <option value="deadline_desc">Дедлайн по убыванию</option>
        </Select>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-40" />)}
        </div>
      ) : tasks.length ? (
        <motion.div layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <TaskCard task={task} onChanged={reload} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="py-16 text-center">
          <h3 className="text-xl font-bold">Задачи не найдены</h3>
          <p className="mt-2 text-slate-500">Создайте первую задачу или измените фильтры.</p>
        </Card>
      )}
    </div>
  );
}
