import { api } from "./client";
import type {
  PaginatedResponse,
  WorkerProfile,
  WorkerPublic,
} from "@/types/api";

export interface WorkerProfileUpdate {
  skills?: string[];
  primary_skill?: string;
  experience_years?: number;
  hourly_rate?: number;
  daily_rate?: number;
  bio?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  is_available?: boolean;
}

export interface WorkerSearchParams {
  skill?: string;
  city?: string;
  min_rating?: number;
  is_available?: boolean;
  page?: number;
  page_size?: number;
}

export const workersApi = {
  search: (params: WorkerSearchParams = {}) =>
    api
      .get<PaginatedResponse<WorkerPublic>>("/workers", { params })
      .then((r) => r.data),

  getById: (userId: number) =>
    api.get<WorkerPublic>(`/workers/${userId}`).then((r) => r.data),

  getMe: () => api.get<WorkerProfile>("/workers/me").then((r) => r.data),

  updateMe: (payload: WorkerProfileUpdate) =>
    api.patch<WorkerProfile>("/workers/me", payload).then((r) => r.data),
};
