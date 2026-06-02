export type User = {
  id: number;
  email: string;
  username: string;
  telegram_connected: boolean;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  created_at: string;
};

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Notification = {
  id: number;
  task_id?: number | null;
  title: string;
  message: string;
  type: "deadline" | "status" | "system";
  is_read: boolean;
  created_at: string;
};

export type Stats = {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  unread_notifications: number;
  completion_rate: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  weekly_completed: Array<{ date: string; count: number }>;
};

export type TelegramStatus = {
  enabled: boolean;
  connected: boolean;
  link_code?: string | null;
};
