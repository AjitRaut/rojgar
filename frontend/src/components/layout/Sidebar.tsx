"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Briefcase,
  Building2,
  ClipboardList,
  FileText,
  Home,
  MessageSquareWarning,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/stores/hooks";
import type { UserRole } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/workers", label: "Find Workers", icon: Search, roles: ["customer", "company", "admin"] },
  { href: "/jobs", label: "Browse Jobs", icon: Briefcase, roles: ["worker", "admin"] },
  { href: "/jobs/new", label: "Post a Job", icon: PlusCircle, roles: ["customer", "company"] },
  { href: "/jobs/my", label: "My Posted Jobs", icon: ClipboardList, roles: ["customer", "company"] },
  { href: "/jobs/applications", label: "My Applications", icon: FileText, roles: ["worker"] },
  { href: "/worker-profile", label: "Worker Profile", icon: User, roles: ["worker"] },
  { href: "/company-profile", label: "Company Profile", icon: Building2, roles: ["company"] },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin", label: "Admin Overview", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/users", label: "Manage Users", icon: Users, roles: ["admin"] },
  { href: "/admin/complaints", label: "All Complaints", icon: Bot, roles: ["admin"] },
  { href: "/admin/reports", label: "Reports", icon: BarChart2, roles: ["admin"] },
  { href: "/profile", label: "Account", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <nav className="flex h-full flex-col gap-1 p-3 scrollbar-thin overflow-y-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}