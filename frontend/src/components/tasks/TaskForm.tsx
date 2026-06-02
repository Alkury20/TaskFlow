import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetchCategories } from "@/features/categories/api";
import { createTask, type TaskPayload } from "@/features/tasks/api";
import { priorityLabels, statusLabels } from "@/lib/constants";
import type { Category } from "@/types";

export function TaskForm({ onCreated }: { onCreated: () => void }) {
  const [payload, setPayload] = useState<TaskPayload>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await createTask({
        ...payload,
        description: payload.description || undefined,
        deadline: payload.deadline ? new Date(payload.deadline).toISOString() : undefined,
        category_id: payload.category_id || undefined,
      });
      toast.success("Задача создана");
      setPayload({ title: "", description: "", status: "todo", priority: "medium" });
      onCreated();
    } catch {
      toast.error("Не удалось создать задачу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-3 rounded-2xl border bg-card/80 p-4 backdrop-blur-xl md:grid-cols-5" onSubmit={submit}>
      <Input
        className="md:col-span-2"
        placeholder="Название задачи"
        value={payload.title}
        onChange={(event) => setPayload({ ...payload, title: event.target.value })}
        required
      />
      <Select value={payload.status} onChange={(event) => setPayload({ ...payload, status: event.target.value as TaskPayload["status"] })}>
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>
      <Select value={payload.priority} onChange={(event) => setPayload({ ...payload, priority: event.target.value as TaskPayload["priority"] })}>
        {Object.entries(priorityLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>
      <Button disabled={loading}>{loading ? "Создание..." : "Добавить задачу"}</Button>
      <Input
        className="md:col-span-2"
        placeholder="Краткое описание"
        value={payload.description}
        onChange={(event) => setPayload({ ...payload, description: event.target.value })}
      />
      <Input
        type="datetime-local"
        value={payload.deadline ?? ""}
        onChange={(event) => setPayload({ ...payload, deadline: event.target.value || undefined })}
      />
      <Select
        className="md:col-span-2"
        value={payload.category_id ?? ""}
        onChange={(event) => setPayload({ ...payload, category_id: event.target.value ? Number(event.target.value) : undefined })}
      >
        <option value="">Без категории</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </Select>
    </form>
  );
}
