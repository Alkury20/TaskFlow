import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.email, values.password);
      toast.success("Добро пожаловать");
      navigate("/dashboard");
    } catch {
      toast.error("Неверная почта или пароль");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary">TaskFlow SaaS</p>
            <h1 className="mt-2 text-3xl font-black">Войдите в рабочее пространство</h1>
            <p className="mt-2 text-sm text-slate-500">После заполнения демо-данных используйте demo@taskflow.dev / password123.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Почта" type="email" {...register("email")} />
            <Input placeholder="Пароль" type="password" {...register("password")} />
            <Button className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Вход..." : "Войти"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Нет аккаунта?{" "}
            <Link className="font-semibold text-primary" to="/register">
              Создать
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
