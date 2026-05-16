"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { complaintsApi, type ComplaintCreate } from "@/lib/api/complaints";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";

export function useMyComplaints() {
  return useQuery({
    queryKey: QUERY_KEYS.myComplaints,
    queryFn: () => complaintsApi.listMine(),
  });
}

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ComplaintCreate) => complaintsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.myComplaints });
      toast.success("Complaint submitted");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
