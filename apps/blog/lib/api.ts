const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface InquiryPayload {
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  organizationName: string;
  city?: string;
  productModel: string;
  serialNumber?: string;
  purchaseDate?: string;
  reportedProblem: string;
  urgency?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<{ inquiryNumber: string }> {
  const res = await fetch(`${BASE}/api/v1/portal/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not submit your request. Please try again or call us.");
  }

  return res.json() as Promise<{ inquiryNumber: string }>;
}
