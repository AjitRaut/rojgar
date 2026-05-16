"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { ReduxProvider } from "./redux-provider";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
