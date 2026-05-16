"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewsApi, type ReviewCreate } from "@/lib/api/reviews";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";

export function useReviewsForUser(userId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.reviewsForUser(userId),
    queryFn: () => reviewsApi.listForUser(userId),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewCreate) => reviewsApi.create(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reviewsForUser(data.reviewee_id) });
      qc.invalidateQueries({ queryKey: ["worker"] });
      qc.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Review submitted");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
