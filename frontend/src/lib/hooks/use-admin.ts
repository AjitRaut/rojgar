"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi, type AdminUserParams } from "@/lib/api/admin";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import type { ComplaintStatus } from "@/types/api";

export function useAdminUsers(params: AdminUserParams) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers(params),
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: QUERY_KEYS.adminAnalytics,
    queryFn: () => adminApi.analytics(),
    refetchInterval: 30 * 1000,
  });
}

export function useAdminComplaints() {
  return useQuery({
    queryKey: QUERY_KEYS.adminComplaints,
    queryFn: () => adminApi.listComplaints(),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.toggleActive(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User status changed");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useVerifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.verifyUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminAnalytics });
      toast.success("User verified");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useUpdateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      admin_response,
    }: {
      id: number;
      status: ComplaintStatus;
      admin_response?: string;
    }) => adminApi.updateComplaint(id, status, admin_response),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminComplaints });
      toast.success("Complaint updated");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
