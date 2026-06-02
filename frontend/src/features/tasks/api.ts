import { api } from "@/lib/axios";
import type { Task, TaskPriority, TaskStatus } from "@/types";

export type TaskPayload = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  category_id?: number;
};

export async function fetchTasks(params?: Record<string, string | undefined>) {
  const { data } = await api.get<Task[]>("/tasks", { params });
  return data;
}

export async function createTask(payload: TaskPayload) {
  const { data } = await api.post<Task>("/tasks", payload);
  return data;
}

export async function updateTask(id: number, payload: Partial<TaskPayload>) {
  const { data } = await api.put<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function updateTaskStatus(id: number, status: TaskStatus) {
  const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id: number) {
  await api.delete(`/tasks/${id}`);
}
