import { api } from "./client";
import type {
  ChatMessage,
  ChatResponse,
  JobCategorizeResponse,
  ProfileOptimizeResponse,
  WageSuggestResponse,
  WorkerRecommendResponse,
} from "@/types/api";

export const aiApi = {
  chat: (message: string, history: ChatMessage[] = []) =>
    api
      .post<ChatResponse>("/ai/chat", { message, history })
      .then((r) => r.data),

  categorizeJob: (description: string) =>
    api
      .post<JobCategorizeResponse>("/ai/categorize-job", { description })
      .then((r) => r.data),

  suggestWage: (skill: string, city: string, experience_years: number) =>
    api
      .post<WageSuggestResponse>("/ai/suggest-wage", { skill, city, experience_years })
      .then((r) => r.data),

  optimizeProfile: (payload: { bio?: string; skills?: string[]; experience_years: number }) =>
    api
      .post<ProfileOptimizeResponse>("/ai/optimize-profile", payload)
      .then((r) => r.data),

  recommendWorkers: (payload: {
    job_description: string;
    city?: string;
    skill?: string;
    limit?: number;
  }) =>
    api
      .post<WorkerRecommendResponse>("/ai/recommend-workers", payload)
      .then((r) => r.data),
};
