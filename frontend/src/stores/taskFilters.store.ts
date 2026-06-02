import { create } from "zustand";

import type { TaskPriority, TaskStatus } from "@/types";

type TaskFiltersState = {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sort: string;
  setSearch: (search: string) => void;
  setStatus: (status?: TaskStatus) => void;
  setPriority: (priority?: TaskPriority) => void;
  setSort: (sort: string) => void;
};

export const useTaskFiltersStore = create<TaskFiltersState>((set) => ({
  search: "",
  sort: "created_desc",
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setPriority: (priority) => set({ priority }),
  setSort: (sort) => set({ sort }),
}));
