import { api } from "./client";
import type { Complaint } from "@/types/api";

export interface ComplaintCreate {
  subject: string;
  description: string;
  against_id?: number;
  job_id?: number;
}

export const complaintsApi = {
  create: (payload: ComplaintCreate) =>
    api.post<Complaint>("/complaints", payload).then((r) => r.data),

  listMine: () => api.get<Complaint[]>("/complaints/me").then((r) => r.data),
};
