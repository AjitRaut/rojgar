"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companiesApi, type CompanyProfileUpdate } from "@/lib/api/companies";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";

export function useMyCompanyProfile(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.companyMe,
    queryFn: () => companiesApi.getMe(),
    enabled,
  });
}

export function useUpdateMyCompanyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyProfileUpdate) => companiesApi.updateMe(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.companyMe });
      toast.success("Company profile updated");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
