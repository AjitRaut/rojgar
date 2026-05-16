import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_PREFIX, API_URL, STORAGE_KEYS } from "@/lib/constants";

function getStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStored(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
}

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStored(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const url = original.url || "";
    if (url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(error);
          original.headers.Authorization = `Bearer ${token}`;
          original._retry = true;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getStored(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error("No refresh token");

      const resp = await axios.post(
        `${API_URL}${API_PREFIX}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccess = resp.data.access_token;
      const newRefresh = resp.data.refresh_token;
      setStored(STORAGE_KEYS.ACCESS_TOKEN, newAccess);
      setStored(STORAGE_KEYS.REFRESH_TOKEN, newRefresh);
      processQueue(newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      processQueue(null);
      setStored(STORAGE_KEYS.ACCESS_TOKEN, null);
      setStored(STORAGE_KEYS.REFRESH_TOKEN, null);
      setStored(STORAGE_KEYS.USER, null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(error.response?.data?.errors)) {
      return error.response?.data?.errors
        .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
        .join(", ");
    }
    return error.message || "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
