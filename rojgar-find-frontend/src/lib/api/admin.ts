import { api } from "./client";
import type {
  AdminAnalytics,
  AdminUserListItem,
  Complaint,
  ComplaintStatus,
  PaginatedResponse,
  UserRole,
} from "@/types/api";

export interface AdminUserParams {
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export const adminApi = {
  listUsers: (params: AdminUserParams = {}) =>
    api
      .get<PaginatedResponse<AdminUserListItem>>("/admin/users", { params })
      .then((r) => r.data),

  toggleActive: (userId: number) =>
    api
      .post<{ message: string }>(`/admin/users/${userId}/toggle-active`)
      .then((r) => r.data),

  verifyUser: (userId: number) =>
    api
      .post<{ message: string }>(`/admin/users/${userId}/verify`)
      .then((r) => r.data),

  listComplaints: () =>
    api.get<Complaint[]>("/admin/complaints").then((r) => r.data),

  updateComplaint: (id: number, status: ComplaintStatus, admin_response?: string) =>
    api
      .patch<Complaint>(`/admin/complaints/${id}`, { status, admin_response })
      .then((r) => r.data),

  analytics: () =>
    api.get<AdminAnalytics>("/admin/analytics/overview").then((r) => r.data),
};
