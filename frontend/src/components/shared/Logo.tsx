import Link from "next/link";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-bold", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-violet-500 to-accent text-white shadow-md">
        <Briefcase className="h-5 w-5" />
      </span>
      <span className="text-lg tracking-tight">
        Rojgar
      </span>
    </Link>
  );
}
