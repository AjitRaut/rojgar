"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workersApi, WorkerProfileUpdate, WorkerSearchParams } from "@/lib/api/workers";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";

export function useWorkers(params: WorkerSearchParams) {
  return useQuery({
    queryKey: QUERY_KEYS.workers(params),
    queryFn: () => workersApi.search(params),
    staleTime: 60 * 1000,
  });
}

export function useWorker(userId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.worker(userId),
    queryFn: () => workersApi.getById(userId),
    enabled: !!userId,
  });
}

export function useMyWorkerProfile(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.workerMe,
    queryFn: () => workersApi.getMe(),
    enabled,
  });
}

export function useUpdateMyWorkerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorkerProfileUpdate) => workersApi.updateMe(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.workerMe });
      qc.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
