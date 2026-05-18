import { api } from "./client";

export interface ReportMeta {
  id: string;
  title: string;
  description: string;
  has_date_filter: boolean;
  icon: string;
  extra_param?: { name: string; type: string; default: number };
}

export interface ReportDownloadParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
}

/**
 * Fetches the list of all available reports from the backend.
 */
export const reportsApi = {
  listReports: (): Promise<ReportMeta[]> =>
    api.get<ReportMeta[]>("/admin/reports/list").then((r) => r.data),

  /**
   * Downloads a report PDF and triggers browser download.
   * @param reportId  e.g. "user-registration"
   * @param params    Optional date filters / limit
   */
  downloadReport: async (reportId: string, params: ReportDownloadParams = {}): Promise<void> => {
    const cleanParams: Record<string, string | number> = {};
    if (params.start_date) cleanParams.start_date = params.start_date;
    if (params.end_date) cleanParams.end_date = params.end_date;
    if (params.limit) cleanParams.limit = params.limit;

    const response = await api.get(`/admin/reports/${reportId}`, {
      params: cleanParams,
      responseType: "blob",
    });

    const blob = new Blob([response.data as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportId}_report.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};