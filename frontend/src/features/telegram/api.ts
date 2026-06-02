import { api } from "@/lib/axios";
import type { TelegramStatus } from "@/types";

export async function fetchTelegramStatus() {
  const { data } = await api.get<TelegramStatus>("/telegram/status");
  return data;
}

export async function regenerateTelegramLinkCode() {
  const { data } = await api.post<TelegramStatus>("/telegram/link-code");
  return data;
}

export async function unlinkTelegram() {
  const { data } = await api.delete<TelegramStatus>("/telegram/unlink");
  return data;
}
