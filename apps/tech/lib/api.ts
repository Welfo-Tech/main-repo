const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const TOKEN_KEY = "welfoTechToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode */
  }
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }

  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(p: string, body: unknown) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(body) }),
};

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    user?: { name: string; role: string };
    error?: string;
  };

  if (!res.ok) throw new ApiError(data.error ?? "Could not sign in", res.status);

  if (data.user && data.user.role !== "TECHNICIAN") {
    throw new ApiError("This portal is for technicians. Use the admin panel instead.", 403);
  }

  if (!data.accessToken) throw new ApiError("No session returned", 500);

  try {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
  } catch {
    throw new ApiError("Browser storage is blocked, so you cannot stay signed in.", 500);
  }

  return data.user ?? null;
}

export async function uploadPhoto(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error(`Could not upload ${file.name}`);
}

export interface TechProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string | null;
  specializations: string[];
  caseCounts: Record<string, number>;
}

export interface CaseRow {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  irreparableState: string | null;
  organization: { id: string; name: string };
  product: { id: string; serialNumber: string; model: { name: string } | null };
  createdAt: string;
}

export interface CaseDetail extends CaseRow {
  intakeCondition: string | null;
  holdReason: string | null;
  irreparableReason: string | null;
  irreparableVerdictNote: string | null;
  ticket: { id: string; ticketNumber: string } | null;
}

export interface RepairEvent {
  id: string;
  eventType: string;
  description: string;
  eventAt: string;
  technician: { employeeId: string; user: { name: string } };
}

export interface CasePhotos {
  customer: { source: string; url: string }[];
  technician: {
    id: string;
    category: string;
    url: string;
    fileName: string;
    uploadedAt: string;
    uploadedBy: string;
  }[];
}
