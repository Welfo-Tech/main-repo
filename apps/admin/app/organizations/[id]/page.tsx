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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactForm.name.trim()) {
      setContactFormError("Name is required.");
      return;
    }
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
        <div className="p-8 text-slate-400">Loading…</div>
      </AdminLayout>
    );
  }

  if (error || !org) {
    return (
      <AdminLayout>
        <div className="p-8">
          <p className="text-red-600 text-sm">{error || "Organization not found."}</p>
          <button
            onClick={() => router.push("/organizations")}
            className="mt-4 text-sm text-[#0F4C81] hover:underline"
          >
            ← Back to Organizations
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/organizations")}
            className="text-sm text-slate-500 hover:text-slate-800 transition"
          >
            ← Organizations
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-800">{org.name}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-800">{org.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {TYPE_LABELS[org.type]} · {TIER_LABELS[org.tier]}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${org.isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
              {org.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div>
              <p className="text-slate-500">GST Number</p>
              <p className="mt-1 font-medium text-slate-800 font-mono">{org.gstNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500">PAN Number</p>
              <p className="mt-1 font-medium text-slate-800 font-mono">{org.panNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500">Payment Terms</p>
              <p className="mt-1 font-medium text-slate-800">{org.paymentTermsDays} days</p>
            </div>
            <div>
              <p className="text-slate-500">Website</p>
              {org.website
                ? <a href={org.website} target="_blank" rel="noreferrer" className="mt-1 font-medium text-[#0F4C81] hover:underline block truncate">{org.website}</a>
                : <p className="mt-1 font-medium text-slate-800">—</p>
              }
            </div>
          </div>

          {org.notes && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">Notes</p>
              <p className="mt-1 text-sm text-slate-700">{org.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Contacts</h2>
              <p className="text-sm text-slate-500">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => { setShowContactForm(!showContactForm); setContactFormError(""); }}
              className="rounded-xl bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a3560]"
            >
              {showContactForm ? "Cancel" : "+ Add Contact"}
            </button>
          </div>

          {showContactForm && (
            <form
              onSubmit={handleAddContact}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
            >
              <h3 className="text-base font-semibold text-slate-800">New Contact</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Dr. Priya Sharma"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                  <input
                    value={contactForm.designation}
                    onChange={e => setContactForm(f => ({ ...f, designation: e.target.value }))}
                    placeholder="Head of Procurement"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="priya@hospital.in"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    value={contactForm.phone}
                    onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91-9876543210"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactForm.isPrimary}
                  onChange={e => setContactForm(f => ({ ...f, isPrimary: e.target.checked }))}
                  className="rounded border-slate-300 text-[#0F4C81] focus:ring-[#00B4D8]"
                />
                Set as primary contact
              </label>

              {contactFormError && <p className="text-sm text-red-600">{contactFormError}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560] disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Add Contact"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowContactForm(false); setContactForm(emptyContactForm); setContactFormError(""); }}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Designation</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No contacts yet.</td>
                  </tr>
                ) : contacts.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{c.name}</span>
                        {c.isPrimary && (
                          <span className="inline-flex items-center rounded-full bg-[#0F4C81]/10 px-2 py-0.5 text-xs font-semibold text-[#0F4C81]">Primary</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.designation ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{c.email ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{c.phone ?? "—"}</td>
                    <td className="px-6 py-4">
                      {c.isActive
                        ? <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">Active</span>
                        : <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Inactive</span>
                      }
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
