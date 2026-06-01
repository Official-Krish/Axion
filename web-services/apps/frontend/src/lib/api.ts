import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/config";

export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("token");
  if (raw) {
    config.headers.Authorization = raw.startsWith("Bearer ")
      ? raw
      : `Bearer ${raw}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const status = error.response?.status;

    const getErrorMessage = (): string => {
      if (data?.error?.message) return data.error.message;
      if (data?.error)
        return typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
      if (data?.message) return data.message;
      if (error.message === "Network Error")
        return "Network error. Please check your connection.";
      if (error.code === "ECONNABORTED")
        return "Request timed out. Please try again.";
      return "Something went wrong. Please try again.";
    };

    if (status === 401) {
      const msg = getErrorMessage();
      if (
        msg.toLowerCase().includes("token expired") ||
        msg.toLowerCase().includes("no token")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/signin";
        return Promise.reject(error);
      }
    }

    toast.error(getErrorMessage(), { position: "bottom-right" });
    return Promise.reject(error);
  },
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}
