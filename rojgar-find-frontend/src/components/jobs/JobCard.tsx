"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, IndianRupee, MapPin, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Job, JobStatus } from "@/types/api";

const STATUS_VARIANT: Record<JobStatus, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  open: "success",
  in_progress: "warning",
  completed: "default",
  cancelled: "destructive",
  closed: "secondary",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
};

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <Card className="group h-full transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {job.category}
                </Badge>
                {job.is_urgent && (
                  <Badge variant="destructive" className="font-normal">
                    <Zap className="mr-1 h-3 w-3" /> Urgent
                  </Badge>
                )}
                <Badge variant={STATUS_VARIANT[job.status]} className="font-normal">
                  {STATUS_LABEL[job.status]}
                </Badge>
              </div>
              <h3 className="mt-2 line-clamp-2 font-semibold leading-snug">{job.title}</h3>
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.workers_needed} needed
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {job.duration_days}d
            </span>
            <span>{formatRelativeTime(job.created_at)}</span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
            <div className="flex items-center text-sm">
              <IndianRupee className="h-4 w-4" />
              <span className="font-semibold">{formatCurrency(job.daily_wage).replace("₹", "")}</span>
              <span className="text-muted-foreground">/day</span>
            </div>
            <Button asChild size="sm">
              <Link href={`/jobs/${job.id}`}>View Job</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
