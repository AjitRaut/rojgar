"use client";

import {
  Briefcase,
  ClipboardList,
  Download,
  LayoutGrid,
  Loader2,
  MapPin,
  ShieldAlert,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { type ReportMeta, type ReportDownloadParams } from "@/lib/api/reports";

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Briefcase,
  LayoutGrid,
  Wrench,
  MapPin,
  ClipboardList,
  ShieldAlert,
  Star,
};

interface ReportCardProps {
  report: ReportMeta;
  onDownload: (id: string, params: ReportDownloadParams) => void;
  isDownloading: boolean;
  startDate: string;
  endDate: string;
  limit: number;
}

export function ReportCard({
  report,
  onDownload,
  isDownloading,
  startDate,
  endDate,
  limit,
}: ReportCardProps) {
  const Icon = ICON_MAP[report.icon] ?? Download;

  const handleClick = () => {
    const params: ReportDownloadParams = {};
    if (report.has_date_filter) {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }
    if (report.extra_param?.name === "limit") {
      params.limit = limit;
    }
    onDownload(report.id, params);
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight text-foreground">{report.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{report.description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {report.has_date_filter && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5">Supports date filter</span>
          </div>
        )}
        {report.extra_param && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5">
              Limit: top {limit} results
            </span>
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={isDownloading}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}