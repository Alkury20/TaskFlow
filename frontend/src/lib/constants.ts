import type { TaskPriority, TaskStatus } from "@/types";

export const statusLabels: Record<TaskStatus, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  urgent: "Срочный",
};

export const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  medium: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  high: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  urgent: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
};
