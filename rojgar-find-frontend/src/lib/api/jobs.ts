import { api } from "./client";
import type {
  ApplicationStatus,
  Job,
  JobApplication,
  JobStatus,
  PaginatedResponse,
} from "@/types/api";

export interface JobCreatePayload {
  title: string;
  description: string;
  category: string;
  skills_required?: string[];
  workers_needed?: number;
  daily_wage: number;
  total_budget?: number;
  duration_days?: number;
  city: string;
  state?: string;
  pincode?: string;
  address?: string;
  start_date?: string;
  is_urgent?: boolean;
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> {
  status?: JobStatus;
}

export interface JobSearchParams {
  category?: string;
  city?: string;
  status?: JobStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface JobApplicationCreate {
  cover_message?: string;
  proposed_rate?: number;
}

export const jobsApi = {
  list: (params: JobSearchParams = {}) =>
    api
      .get<PaginatedResponse<Job>>("/jobs", { params })
      .then((r) => r.data),

  getById: (id: number) => api.get<Job>(`/jobs/${id}`).then((r) => r.data),

  create: (payload: JobCreatePayload) =>
    api.post<Job>("/jobs", payload).then((r) => r.data),

  update: (id: number, payload: JobUpdatePayload) =>
    api.patch<Job>(`/jobs/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<{ message: string }>(`/jobs/${id}`).then((r) => r.data),

  myPosted: (params: { page?: number; page_size?: number } = {}) =>
    api
      .get<PaginatedResponse<Job>>("/jobs/my/posted", { params })
      .then((r) => r.data),

  myApplications: () =>
    api.get<JobApplication[]>("/jobs/my/applications").then((r) => r.data),

  apply: (jobId: number, payload: JobApplicationCreate = {}) =>
    api.post<JobApplication>(`/jobs/${jobId}/apply`, payload).then((r) => r.data),

  listApplications: (jobId: number) =>
    api.get<JobApplication[]>(`/jobs/${jobId}/applications`).then((r) => r.data),

  decideApplication: (applicationId: number, status: ApplicationStatus) =>
    api
      .patch<JobApplication>(`/jobs/applications/${applicationId}`, { status })
      .then((r) => r.data),

  complete: (id: number) =>
    api.post<Job>(`/jobs/${id}/complete`).then((r) => r.data),
};
