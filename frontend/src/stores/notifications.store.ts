import { create } from "zustand";

import { api } from "@/lib/axios";
import type { Notification } from "@/types";

type NotificationsState = {
  notifications: Notification[];
  load: () => Promise<void>;
  generateDeadlineReminders: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  async load() {
    const { data } = await api.get<Notification[]>("/notifications");
    set({ notifications: data });
  },
  async generateDeadlineReminders() {
    await api.post<Notification[]>("/notifications/generate-deadline-reminders");
    await get().load();
  },
  async markRead(id) {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
    set({ notifications: get().notifications.map((item) => (item.id === id ? data : item)) });
  },
}));
