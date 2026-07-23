const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cspremium_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cspremium_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cspremium_token");
  localStorage.removeItem("cspremium_user");
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean; // attach bearer token, default true
  signal?: AbortSignal;
}

/**
 * Generic fetch wrapper for the Express API.
 * - Serializes JSON bodies
 * - Attaches the bearer token from localStorage unless auth: false
 * - Throws ApiClientError with the backend's message on non-2xx responses
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  let finalBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      finalBody = body;
    } else {
      finalHeaders["Content-Type"] = "application/json";
      finalBody = JSON.stringify(body);
    }
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      isJson && payload?.error?.message ? payload.error.message : "Something went wrong. Please try again.";
    throw new ApiClientError(res.status, message, isJson ? payload?.error?.details : undefined);
  }

  return isJson ? payload.data : (payload as T);
}

/**
 * Fetches a CSV export (or any binary/text download) with auth headers attached,
 * then triggers a browser download. Needed because Bearer tokens can't ride along
 * on a plain <a href> download link.
 */
export async function downloadWithAuth(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    throw new ApiClientError(res.status, "Failed to download the file.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Resolves a server-relative asset path (e.g. "/uploads/rewards/xyz.jpg") returned
 * by the API into a fully-qualified URL. Uploaded files are served from the API's
 * root, not under /api, so this strips the /api suffix from the configured base URL.
 */
export function getAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const root = API_URL.replace(/\/api\/?$/, "");
  return `${root}${path}`;
}

export { API_URL };
