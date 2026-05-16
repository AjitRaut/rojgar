"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiApi } from "@/lib/api/ai";
import { extractErrorMessage } from "@/lib/api/client";
import type { ChatMessage } from "@/types/api";

export function useAiChat() {
  return useMutation({
    mutationFn: ({ message, history }: { message: string; history: ChatMessage[] }) =>
      aiApi.chat(message, history),
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useCategorizeJob() {
  return useMutation({
    mutationFn: (description: string) => aiApi.categorizeJob(description),
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useSuggestWage() {
  return useMutation({
    mutationFn: ({
      skill,
      city,
      experience_years,
    }: {
      skill: string;
      city: string;
      experience_years: number;
    }) => aiApi.suggestWage(skill, city, experience_years),
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useOptimizeProfile() {
  return useMutation({
    mutationFn: (payload: { bio?: string; skills?: string[]; experience_years: number }) =>
      aiApi.optimizeProfile(payload),
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useRecommendWorkers() {
  return useMutation({
    mutationFn: (payload: {
      job_description: string;
      city?: string;
      skill?: string;
      limit?: number;
    }) => aiApi.recommendWorkers(payload),
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}
