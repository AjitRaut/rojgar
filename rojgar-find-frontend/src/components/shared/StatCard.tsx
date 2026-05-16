import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export function StatCard({ icon: Icon, label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
