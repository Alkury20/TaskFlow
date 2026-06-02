import { api } from "@/lib/axios";
import type { Stats } from "@/types";

export async function fetchStats() {
  const { data } = await api.get<Stats>("/stats");
  return data;
}
