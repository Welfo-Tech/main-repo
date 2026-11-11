"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import type { Organization } from "../../../types/organization";
import { OrganizationType, OrganizationTier } from "../../../types/organization";
import type { CustomerContact } from "../../../types/contact";

const TYPE_LABELS: Record<OrganizationType, string> = {
  HOSPITAL: "Hospital",
  CLINIC: "Clinic",
  DISTRIBUTOR: "Distributor",
  DEALER: "Dealer",
  SERVICE_PARTNER: "Service Partner",
};

const TIER_LABELS: Record<OrganizationTier, string> = {
  STANDARD: "Standard",
  PREMIUM: "Premium",
  ENTERPRISE: "Enterprise",
};

const emptyContactForm = { name: "", designation: "", email: "", phone: "", isPrimary: false };

const inputStyle: React.CSSProperties = {
  height: "var(--w-control-h)",
  padding: "0 var(--w-s-2)",
  fontSize: "var(--w-fs-body)",
  fontFamily: "var(--w-font-body)",
  border: "1px solid var(--w-border)",
  background: "var(--w-sunken)",
  color: "var(--w-text-1)",
  borderRadius: "var(--w-radius)",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--w-fs-label)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--w-text-2)",
  display: "block",
  marginBottom: "var(--w-s-1)",
};

const TH_STYLE: React.CSSProperties = {
  fontSize: "var(--w-fs-eyebrow)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: "var(--w-text-2)",
  padding: "0 var(--w-s-3)",
  height: "var(--w-row-h)",
  borderBottom: "1px solid var(--w-border)",
  textAlign: "left",
  whiteSpace: "nowrap" as const,
};

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [org, setOrg] = useState<Organization | null>(null);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [contactFormError, setContactFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [orgData, contactsData] = await Promise.all([
        api.get<Organization>(`/api/v1/organizations/${id}`),
        api.get<CustomerContact[]>(`/api/v1/organizations/${id}/contacts`),
      ]);
      setOrg(orgData);
      setContacts(contactsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactForm.name.trim()) { setContactFormError("Name is required."); return; }
    setSubmitting(true);
    setContactFormError("");
    try {
      await api.post(`/api/v1/organizations/${id}/contacts`, {
        name: contactForm.name.trim(),
        ...(contactForm.designation.trim() && { designation: contactForm.designation.trim() }),
        ...(contactForm.email.trim() && { email: contactForm.email.trim() }),
        ...(contactForm.phone.trim() && { phone: contactForm.phone.trim() }),
        isPrimary: contactForm.isPrimary,
      });
      setContactForm(emptyContactForm);
      setShowContactForm(false);
      await fetchAll();
    } catch (err) {
      setContactFormError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "var(--w-s-6)", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</div>
      </AdminLayout>
    );
  }

  if (error || !org) {
    return (
      <AdminLayout>
        <div style={{ padding: "var(--w-s-6)" }}>
          <p style={{ color: "var(--w-attention-fg)", fontSize: "var(--w-fs-body)" }}>{error || "Organization not found."}</p>
          <button onClick={() => router.push("/organizations")} style={{ marginTop: "var(--w-s-4)", color: "var(--w-link)", fontSize: "var(--w-fs-body)", background: "none", border: "none", cursor: "pointer" }}>
            ← Back to Organizations
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "var(--w-page-max)" }}>

        <div className="flex items-center gap-2" style={{ marginBottom: "var(--w-s-4)" }}>
          <button onClick={() => router.push("/organizations")} style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", background: "none", border: "none", cursor: "pointer" }}>
            Organizations
          </button>
          <span style={{ color: "var(--w-text-mute)" }}>/</span>
          <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{org.name}</span>
        </div>

        <div className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
          <div className="flex items-start justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
            <div>
              <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
                {org.name}
              </h1>
              <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
                {TYPE_LABELS[org.type]} · {TIER_LABELS[org.tier]}
              </p>
            </div>
            <span className="flex items-center gap-1">
              <span style={{ width: "8px", height: "8px", borderRadius: "var(--w-radius-full)", background: org.isActive ? "var(--w-success-dot)" : "var(--w-neutral-dot)", display: "inline-block" }} />
              <span style={{ fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{org.isActive ? "Active" : "Inactive"}</span>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--w-s-4)", borderTop: "1px solid var(--w-border-soft)", paddingTop: "var(--w-s-4)" }}>
            {[
              { label: "GST Number", value: org.gstNumber ?? "—", mono: true },
              { label: "PAN Number", value: org.panNumber ?? "—", mono: true },
              { label: "Payment Terms", value: org.paymentTermsDays != null ? `${org.paymentTermsDays} days` : "—" },
              { label: "Website", value: org.website ?? "—" },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-1)" }}>
                  {label}
                </p>
                <p className="w-num" style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)", fontFamily: mono ? "monospace" : undefined }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {org.notes && (
            <div style={{ marginTop: "var(--w-s-4)", paddingTop: "var(--w-s-4)", borderTop: "1px solid var(--w-border-soft)" }}>
              <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-1)" }}>Notes</p>
              <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)" }}>{org.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-3)" }}>
          <div>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-section)", color: "var(--w-text-1)" }}>Contacts</h2>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "2px" }}>{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { setShowContactForm(!showContactForm); setContactFormError(""); }} className="font-head font-semibold uppercase"
            style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
            {showContactForm ? "Cancel" : "+ Add Contact"}
          </button>
        </div>

        {showContactForm && (
          <form onSubmit={handleAddContact} className="bg-plate border border-border" style={{ padding: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
            <h3 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-subsection)", color: "var(--w-text-1)", marginBottom: "var(--w-s-3)" }}>New Contact</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-3)" }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. Priya Sharma" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Designation</label>
                <input value={contactForm.designation} onChange={e => setContactForm(f => ({ ...f, designation: e.target.value }))} placeholder="Head of Procurement" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="priya@hospital.in" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-9876543210" style={inputStyle} />
              </div>
            </div>
            <label className="flex items-center gap-2" style={{ marginTop: "var(--w-s-3)", fontSize: "var(--w-fs-body)", color: "var(--w-text-2)", cursor: "pointer" }}>
              <input type="checkbox" checked={contactForm.isPrimary} onChange={e => setContactForm(f => ({ ...f, isPrimary: e.target.checked }))} />
              Set as primary contact
            </label>
            {contactFormError && (
              <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginTop: "var(--w-s-2)" }}>
                {contactFormError}
              </p>
            )}
            <div className="flex gap-3" style={{ marginTop: "var(--w-s-3)" }}>
              <button type="submit" disabled={submitting} className="font-head font-semibold uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: submitting ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Saving…" : "Add Contact"}
              </button>
              <button type="button" onClick={() => { setShowContactForm(false); setContactForm(emptyContactForm); }} className="font-head font-medium uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-3)", background: "transparent", color: "var(--w-text-2)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-plate border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--w-sunken)" }}>
                  {["Name", "Designation", "Email", "Phone", "Status"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No contacts yet.</td></tr>
                ) : contacts.map((c, i) => (
                  <tr key={c.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < contacts.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>
                      <span className="flex items-center gap-2">
                        {c.name}
                        {c.isPrimary && (
                          <span style={{ fontSize: "var(--w-fs-badge)", background: "var(--w-progress-tint)", color: "var(--w-progress-fg)", border: "1px solid var(--w-progress-edge)", padding: "1px 5px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            Primary
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{c.designation ?? "—"}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{c.email ?? "—"}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{c.phone ?? "—"}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <span className="flex items-center gap-1">
                        <span style={{ width: "8px", height: "8px", borderRadius: "var(--w-radius-full)", background: c.isActive ? "var(--w-success-dot)" : "var(--w-neutral-dot)", display: "inline-block" }} />
                        <span style={{ fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{c.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
