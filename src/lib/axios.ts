import axios, { AxiosError, type AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { TOKEN_COOKIE_KEY, API_BASE_URL } from "@/constants/app";
import type { InternalAxiosRequestConfig } from "axios";

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
(config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(TOKEN_COOKIE_KEY);
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;

    if (status === 401) {
      Cookies.remove(TOKEN_COOKIE_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    const normalized: AppError = {
      message:
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        "An unexpected error occurred.",
      statusCode: status ?? 0,
      errors: error.response?.data?.errors ?? null,
    };

    return Promise.reject(normalized);
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]> | null;
}

export interface AppError {
  message: string;
  statusCode: number;
  errors: Record<string, string[]> | null;
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    "statusCode" in value
  );
}

export default apiClient;