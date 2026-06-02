import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import { useThemeStore } from "@/stores/theme.store";

export function Providers({ children }: { children: ReactNode }) {
  const applyTheme = useThemeStore((state) => state.applyTheme);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
