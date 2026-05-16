import { DashboardShell } from "@/components/layout/DashboardShell";
import { ChatWidget } from "@/components/ai/ChatWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
      <ChatWidget />
    </DashboardShell>
  );
}
