import type { ServiceName } from "../types/mangaErp";

function envUrl(key: "VITE_API_BASE_URL") {
  const value = import.meta.env[key]?.replace(/\/$/, "");
  return value || undefined;
}

export const API_BASE_URL = envUrl("VITE_API_BASE_URL");

function requiredBaseUrl() {
  if (import.meta.env.DEV) return "";
  if (API_BASE_URL) return API_BASE_URL;
  throw new Error("Missing VITE_API_BASE_URL.");
}

export const SERVICE_BASE_URLS: Record<ServiceName, string> = {
  identity: requiredBaseUrl(),
  submission: requiredBaseUrl(),
  series: requiredBaseUrl(),
  chapter: requiredBaseUrl(),
  task: requiredBaseUrl(),
  qa: requiredBaseUrl(),
  segmentation: requiredBaseUrl(),
  publishing: requiredBaseUrl(),
  media: requiredBaseUrl(),
};
