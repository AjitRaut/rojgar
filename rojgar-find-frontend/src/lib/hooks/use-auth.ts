"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { clearSession, setSession } from "@/lib/stores/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/stores/hooks";
import type { LoginPayload, RegisterPayload } from "@/types/api";

export function useMe() {
  const { user, accessToken, hydrated } = useAppSelector((s) => s.auth);
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: () => authApi.me(),
    enabled: !!accessToken && hydrated,
    initialData: user || undefined,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      dispatch(
        setSession({
          user: data.user,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
        })
      );
      qc.setQueryData(QUERY_KEYS.me, data.user);
      toast.success(`Welcome back, ${data.user.full_name}`);
      router.push("/dashboard");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useRegister() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      dispatch(
        setSession({
          user: data.user,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
        })
      );
      qc.setQueryData(QUERY_KEYS.me, data.user);
      toast.success("Account created. Welcome to Rojgar Find.");
      router.push("/dashboard");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });
}

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return () => {
    dispatch(clearSession());
    qc.clear();
    toast.success("Logged out");
    router.push("/login");
  };
}

export function useAuth() {
  return useAppSelector((s) => s.auth);
}
