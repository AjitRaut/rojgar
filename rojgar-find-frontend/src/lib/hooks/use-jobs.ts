"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  jobsApi,
  type JobApplicationCreate,
  type JobCreatePayload,
  type JobSearchParams,
  type JobUpdatePayload,
} from "@/lib/api/jobs";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import type { ApplicationStatus } from "@/types/api";

export function useJobs(params: JobSearchParams) {
  return useQuery({
    queryKey: QUERY_KEYS.jobs(params),
    queryFn: () => jobsApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.job(id),
    queryFn: () => jobsApi.getById(id),
    enabled: !!id,
  });
}

export function useMyPostedJobs(page = 1, page_size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.myPostedJobs, page, page_size],
    queryFn: () => jobsApi.myPosted({ page, page_size }),
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: QUERY_KEYS.myApplications,
    queryFn: () => jobsApi.myApplications(),
  });
}

export function useJobApplications(jobId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.jobApplications(jobId),
    queryFn: () => jobsApi.listApplications(jobId),
    enabled: !!jobId,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobCreatePayload) => jobsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job posted successfully");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: JobUpdatePayload }) =>
      jobsApi.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.job(data.id) });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useApplyJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, payload }: { jobId: number; payload?: JobApplicationCreate }) =>
      jobsApi.apply(jobId, payload || {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.myApplications });
      toast.success("Application sent");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useDecideApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      jobsApi.decideApplication(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job"] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Application updated");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useCompleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["job"] });
      toast.success("Job marked as completed");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
