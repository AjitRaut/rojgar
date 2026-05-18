"use client";

import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  MapPin,
  ShieldAlert,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CenteredSpinner, ErrorState } from "@/components/shared/States";
import { ReportCard } from "@/components/reports/ReportCard";
import { useReportList, useDownloadReport } from "@/lib/hooks/use-reports";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminReportsPage() {
  const { data: reports, isLoading, isError } = useReportList();
  const { download, downloading } = useDownloadReport();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(20);

  if (isLoading) return <CenteredSpinner />;
  if (isError || !reports) return <ErrorState />;

  const hasDateFilter = reports.some((r) => r.has_date_filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Download PDF reports for platform analytics and insights"
      />

      {/* Global filters */}
      {hasDateFilter && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Date Filters <span className="font-normal normal-case">(applies to reports that support it)</span>
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="start_date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 w-40 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="end_date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 w-40 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="limit" className="text-xs">
                Top Workers Limit
              </Label>
              <Input
                id="limit"
                type="number"
                min={5}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-8 w-24 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Report cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onDownload={download}
            isDownloading={downloading === report.id}
            startDate={startDate}
            endDate={endDate}
            limit={limit}
          />
        ))}
      </div>
    </div>
  );
}