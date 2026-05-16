import { api } from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
} from "@/types/api";

export interface ForgotPasswordResponse {
  message: string;
  dev_reset_link?: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  refresh: (refresh_token: string) =>
    api.post<TokenResponse>("/auth/refresh", { refresh_token }).then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),

  forgotPassword: (email: string) =>
    api
      .post<ForgotPasswordResponse>("/auth/forgot-password", { email })
      .then((r) => r.data),

  resetPassword: (token: string, new_password: string) =>
    api
      .post<{ message: string }>("/auth/reset-password", { token, new_password })
      .then((r) => r.data),
};