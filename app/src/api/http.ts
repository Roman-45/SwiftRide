// Thin fetch wrapper that understands the backend's { success, data, message }
// envelope and attaches the JWT from sessionStorage on every call.
//
// Keep this module tiny — services live in api/client.ts.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000').replace(/\/$/, '');

interface Envelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// The same sessionStorage key AuthContext writes to. Duplicated intentionally —
// importing AuthContext would create a cycle, and the shape is trivial.
const AUTH_STORAGE_KEY = 'sr-auth';

function getToken(): string | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  // 401: the token is gone or expired — clear it so guards can redirect.
  if (res.status === 401) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // 204 No Content is possible (though the backend mostly returns enveloped null).
  if (res.status === 204) return undefined as T;

  let payload: Envelope<T> | null = null;
  try {
    payload = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError(`Unexpected response (${res.status}).`, res.status);
  }

  if (!res.ok || payload?.success === false) {
    const msg = payload?.message || `Request failed (${res.status}).`;
    throw new ApiError(msg, res.status);
  }

  // Some endpoints return null-data on success (accept/start/complete/cancel).
  return (payload?.data as T);
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
