import { useState } from "react";
import { CalendarDays, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { deleteTask, updateTaskStatus } from "@/features/tasks/api";
import { priorityClasses, priorityLabels, statusLabels } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";

const statusOrder: TaskStatus[] = ["todo", "in_progress", "review", "done"];

type TaskCardProps = {
  task: Task;
  onChanged?: () => void;
};

export function TaskCard({ task, onChanged }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const nextStatus = statusOrder[statusOrder.indexOf(task.status) + 1];

  async function changeStatus(status: TaskStatus) {
    if (status === task.status) return;
    setLoading(true);
    try {
      await updateTaskStatus(task.id, status);
      toast.success("Статус задачи обновлен");
      onChanged?.();
    } catch {
      toast.error("Не удалось обновить статус задачи");
    } finally {
      setLoading(false);
    }
  }

  async function removeTask() {
    const confirmed = window.confirm(`Удалить задачу "${task.title}"?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteTask(task.id);
      toast.success("Задача удалена");
      onChanged?.();
    } catch {
      toast.error("Не удалось удалить задачу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description || "Без описания"}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClasses[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-muted px-3 py-1 font-semibold">{statusLabels[task.status]}</span>
        {task.category && (
          <span className="rounded-full px-3 py-1 font-semibold" style={{ backgroundColor: `${task.category.color}22` }}>
            {task.category.name}
          </span>
        )}
        {task.deadline && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
            <CalendarDays size={13} />
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Select
          aria-label="Изменить статус задачи"
          className="py-2"
          disabled={loading}
          value={task.status}
          onChange={(event) => void changeStatus(event.target.value as TaskStatus)}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button
          className="px-3"
          disabled={loading || !nextStatus}
          title={nextStatus ? `Перевести в статус "${statusLabels[nextStatus]}"` : "Задача уже готова"}
          type="button"
          variant="secondary"
          onClick={() => nextStatus && void changeStatus(nextStatus)}
        >
          <CheckCircle2 size={16} />
          {nextStatus ? statusLabels[nextStatus] : "Готово"}
        </Button>
        <Button className="px-3" disabled={loading} type="button" variant="danger" onClick={() => void removeTask()}>
          <Trash2 size={16} />
        </Button>
      </div>
    </Card>
  );
}
