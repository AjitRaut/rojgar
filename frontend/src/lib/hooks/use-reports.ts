import { useQuery } from "@tanstack/react-query";
import { reportsApi, type ReportDownloadParams } from "@/lib/api/reports";
import { useState } from "react";
import { toast } from "sonner";

export function useReportList() {
  return useQuery({
    queryKey: ["admin", "reports", "list"],
    queryFn: reportsApi.listReports,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

export function useDownloadReport() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (reportId: string, params: ReportDownloadParams = {}) => {
    setDownloading(reportId);
    try {
      await reportsApi.downloadReport(reportId, params);
      toast.success("Report downloaded successfully");
    } catch {
      toast.error("Failed to download report. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return { download, downloading };
}