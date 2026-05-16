"use client";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-background lg:block">
          <Sidebar />
        </aside>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
