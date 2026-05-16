import { api } from "./client";
import type { Review, ReviewType } from "@/types/api";

export interface ReviewCreate {
  job_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  review_type: ReviewType;
}

export const reviewsApi = {
  create: (payload: ReviewCreate) =>
    api.post<Review>("/reviews", payload).then((r) => r.data),

  listForUser: (userId: number) =>
    api.get<Review[]>(`/reviews/user/${userId}`).then((r) => r.data),
};
