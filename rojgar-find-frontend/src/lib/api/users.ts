import { api } from "./client";
import type { User } from "@/types/api";

export interface UserUpdatePayload {
  full_name?: string;
  phone?: string;
  profile_image?: string;
  language_pref?: string;
}

export const usersApi = {
  me: () => api.get<User>("/users/me").then((r) => r.data),
  updateMe: (payload: UserUpdatePayload) =>
    api.patch<User>("/users/me", payload).then((r) => r.data),
};
