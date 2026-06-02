import * as React from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/80 p-5 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}
