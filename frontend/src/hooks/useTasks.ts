import { useCallback, useEffect, useState } from "react";

import { fetchTasks } from "@/features/tasks/api";
import { useTaskFiltersStore } from "@/stores/taskFilters.store";
import type { Task } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { search, status, priority, sort } = useTaskFiltersStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasks({ search, status_filter: status, priority, sort });
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [priority, search, sort, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return { tasks, loading, reload: load };
}
