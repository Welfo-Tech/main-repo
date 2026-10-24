const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type SerialCheck =
  | { valid: true; productModel: string; manufacturer: string | null; status: string }
  | { valid: false };

export interface InquiryPayload {
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  organizationName: string;
  city?: string;
  serialNumber: string;
  reportedProblem: string;
  urgency?: string;
  photoFileNames?: string[];
}

export interface UploadTarget {
  path: string;
  uploadUrl: string;
}

export interface SubmitResult {
  inquiryNumber: string;
  uploads: UploadTarget[];
}

export async function uploadPhoto(target: UploadTarget, file: File): Promise<void> {
  const res = await fetch(target.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Could not upload ${file.name}`);
  }
}

export interface TimelineStep {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
  at: string | null;
}

export interface TrackingResult {
  found: boolean;
  reference?: string;
  instrument?: string;
  serialNumber?: string;
  submittedAt?: string;
  caseNumber?: string | null;
  headline?: string;
  timeline?: TimelineStep[];
}

export async function trackRequest(ref: string, email: string): Promise<TrackingResult> {
  const qs = new URLSearchParams({ ref, email });
  const res = await fetch(`${BASE}/api/v1/portal/track?${qs.toString()}`);

  if (res.status === 429) {
    throw new Error("Too many lookups from this connection. Please wait a minute and try again.");
  }
  if (!res.ok) {
    throw new Error("Could not look that up right now. Please try again or call us.");
  }

  return res.json() as Promise<TrackingResult>;
}

export async function verifySerial(serial: string): Promise<SerialCheck> {
  const res = await fetch(
    `${BASE}/api/v1/portal/inquiries/verify-serial?serial=${encodeURIComponent(serial)}`,
  );

  if (res.status === 429) {
    throw new Error("Too many checks from this connection. Please wait a minute and try again.");
  }
  if (!res.ok) {
    throw new Error("Could not check that serial number right now. Please try again.");
  }

  return res.json() as Promise<SerialCheck>;
}

export async function submitInquiry(payload: InquiryPayload): Promise<SubmitResult> {
  const res = await fetch(`${BASE}/api/v1/portal/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 429) {
    throw new Error("Too many requests from this connection. Please wait a few minutes or call us.");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not submit your request. Please try again or call us.");
  }

  return res.json() as Promise<SubmitResult>;
}
