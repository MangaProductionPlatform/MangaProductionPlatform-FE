import { API_BASE_URL } from "../services/mangaErpConfig";

export function resolveMediaUrl(url?: string | null) {
  const value = url?.trim() ?? "";

  if (!value || import.meta.env.DEV || !API_BASE_URL) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  try {
    const parsedUrl = new URL(value);
    const isLocalUrl =
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1";

    if (isLocalUrl) {
      return `${API_BASE_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
  } catch {
    return value;
  }

  return value;
}
