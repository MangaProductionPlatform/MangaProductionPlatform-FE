import type { ApiErrorBody, CurrentUser, ServiceName } from "../types/mangaErp";
import { SERVICE_BASE_URLS } from "./mangaErpConfig";

function readUser(): CurrentUser | null {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = readUser()?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

export async function request<T>(
  service: ServiceName,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body != null && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  Object.entries(authHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(`${SERVICE_BASE_URLS[service]}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await parseErrorBody(response);
    const validationErrors = body.errors
      ? Object.values(body.errors).flat().join(" ")
      : "";
    const detailErrors = body.details
      ?.map((detail) => detail.message)
      .filter(Boolean)
      .join(" ");
    throw new Error(
      validationErrors ||
        detailErrors ||
        body.message ||
        body.title ||
        body.error ||
        `API error ${response.status}`,
    );
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
