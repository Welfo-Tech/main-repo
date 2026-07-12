import React, { useState } from "react";
import { type ApplicationPayload, submitApplication } from "../lib/supabase.js";

type FieldErrors = Partial<Record<keyof ApplicationPayload, string>>;

const EMPTY: ApplicationPayload = {
  full_name: "",
  email: "",
  phone: "",
  linkedin_url: "",
  github_url: "",
  portfolio_url: "",
  college: "",
  degree: "",
  field_of_study: "",
  graduation_year: new Date().getFullYear() + 1,
  frontend_skills: "",
  backend_skills: "",
  db_experience: "",
  notable_projects: "",
  why_welfo: "",
  available_from: "",
  duration: "",
  work_preference: "",
  resume_link: "",
  additional_notes: "",
};

function required(val: string | number) {
  if (typeof val === "number") return val > 0 ? "" : "Required";
  return val.trim() ? "" : "Required";
}

function validateEmail(val: string) {
  if (!val.trim()) return "Required";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "" : "Enter a valid email address";
}

function validateUrl(val: string) {
  if (!val.trim()) return "";
  try { new URL(val); return ""; } catch { return "Enter a valid URL (include https://)"; }
}

function validate(form: ApplicationPayload): FieldErrors {
  return {
    full_name: required(form.full_name),
    email: validateEmail(form.email),
    phone: required(form.phone),
    linkedin_url: validateUrl(form.linkedin_url),
    github_url: validateUrl(form.github_url),
    portfolio_url: validateUrl(form.portfolio_url),
    college: required(form.college),
    degree: required(form.degree),
    field_of_study: required(form.field_of_study),
    graduation_year: form.graduation_year >= 2024 && form.graduation_year <= 2032 ? "" : "Enter a valid year between 2024 and 2032",
    frontend_skills: required(form.frontend_skills),
    backend_skills: required(form.backend_skills),
    db_experience: required(form.db_experience),
    notable_projects: required(form.notable_projects),
    why_welfo: required(form.why_welfo),
    available_from: required(form.available_from),
    duration: required(form.duration),
    work_preference: required(form.work_preference),
    resume_link: form.resume_link.trim()
      ? validateUrl(form.resume_link) || ""
      : "Required",
  };
}

function hasErrors(errors: FieldErrors) {
  return Object.values(errors).some((v) => v && v.length > 0);
}

interface FieldProps {
  id: keyof ApplicationPayload;
  label: string;
  optional?: boolean;
  errors: FieldErrors;
  touched: Partial<Record<keyof ApplicationPayload, boolean>>;
  onBlur: (id: keyof ApplicationPayload) => void;
  children: React.ReactElement;
  hint?: string;
  full?: boolean;
}

function Field({ id, label, optional, errors, touched, onBlur, children, hint, full }: FieldProps) {
  const err = touched[id] ? errors[id] : "";
  const cloned = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    { id, className: err ? "error" : "", onBlur: () => onBlur(id) },
  );

  return (
    <div className={`form-field${full ? " full" : ""}`}>
      <label htmlFor={id}>
        {label}
        {!optional && <span className="required">*</span>}
        {optional && <span className="optional">(optional)</span>}
      </label>
      {cloned}
      {hint && !err && <span className="field-hint">{hint}</span>}
      {err && <span className="field-error">{err}</span>}
    </div>
  );
}

interface Props {
  onSuccess: () => void;
}

export default function ApplicationForm({ onSuccess }: Props) {
  const [form, setForm] = useState<ApplicationPayload>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof ApplicationPayload, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showAllErrors, setShowAllErrors] = useState(false);

  const errors = validate(form);

  function set<K extends keyof ApplicationPayload>(key: K, value: ApplicationPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function touch(id: keyof ApplicationPayload) {
    setTouched((prev) => ({ ...prev, [id]: true }));
  }

  const displayErrors: FieldErrors = showAllErrors
    ? errors
    : Object.fromEntries(
        Object.entries(errors).filter(([k]) => touched[k as keyof ApplicationPayload]),
      );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowAllErrors(true);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitApplication(form);
      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again or email us directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-wrap" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h3>Full Stack Internship — 2026</h3>
        <p>
          Fill in all required fields. This form saves directly — there is no email
          required before submission. We will get back to you within 5–10 business days.
        </p>
      </div>

      <div className="form-body">
        <div className="form-section-label">Personal details</div>
        <div className="form-grid">
          <Field id="full_name" label="Full name" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Arjun Sharma"
              autoComplete="name"
            />
          </Field>

          <Field id="email" label="Email address" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </Field>

          <Field id="phone" label="Phone number" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
          </Field>

          <Field id="linkedin_url" label="LinkedIn" optional errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="url"
              value={form.linkedin_url}
              onChange={(e) => set("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/your-name"
            />
          </Field>

          <Field id="github_url" label="GitHub" optional errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="url"
              value={form.github_url}
              onChange={(e) => set("github_url", e.target.value)}
              placeholder="https://github.com/your-username"
            />
          </Field>

          <Field id="portfolio_url" label="Portfolio / website" optional errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="url"
              value={form.portfolio_url}
              onChange={(e) => set("portfolio_url", e.target.value)}
              placeholder="https://yoursite.dev"
            />
          </Field>
        </div>

        <div className="form-section-label">Academic background</div>
        <div className="form-grid">
          <Field id="college" label="College / University" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="text"
              value={form.college}
              onChange={(e) => set("college", e.target.value)}
              placeholder="IIT Roorkee"
            />
          </Field>

          <Field id="degree" label="Degree" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="text"
              value={form.degree}
              onChange={(e) => set("degree", e.target.value)}
              placeholder="B.Tech, MCA, BSc..."
            />
          </Field>

          <Field id="field_of_study" label="Field of study" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="text"
              value={form.field_of_study}
              onChange={(e) => set("field_of_study", e.target.value)}
              placeholder="Computer Science, IT..."
            />
          </Field>

          <Field id="graduation_year" label="Expected graduation year" errors={displayErrors} touched={touched} onBlur={touch}>
            <input
              type="number"
              value={form.graduation_year}
              onChange={(e) => set("graduation_year", parseInt(e.target.value, 10))}
              min={2024}
              max={2032}
            />
          </Field>
        </div>

        <div className="form-section-label">Technical skills</div>
        <div className="form-grid">
          <Field
            id="frontend_skills"
            label="Frontend skills"
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            hint="List the frameworks and tools you are comfortable with"
            full
          >
            <textarea
              value={form.frontend_skills}
              onChange={(e) => set("frontend_skills", e.target.value)}
              placeholder="React, Next.js, TypeScript, Tailwind CSS, Vite..."
            />
          </Field>

          <Field
            id="backend_skills"
            label="Backend skills"
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            hint="Languages, frameworks, runtimes"
            full
          >
            <textarea
              value={form.backend_skills}
              onChange={(e) => set("backend_skills", e.target.value)}
              placeholder="Node.js, Hono, Express, Python, REST APIs, JWT auth..."
            />
          </Field>

          <Field
            id="db_experience"
            label="Database experience"
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            full
          >
            <textarea
              value={form.db_experience}
              onChange={(e) => set("db_experience", e.target.value)}
              placeholder="PostgreSQL, Prisma, MongoDB, Supabase, MySQL, Redis..."
            />
          </Field>

          <Field
            id="notable_projects"
            label="Notable projects"
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            hint="Tell us about 1–3 projects. What did you build, what stack, what was your role?"
            full
          >
            <textarea
              value={form.notable_projects}
              onChange={(e) => set("notable_projects", e.target.value)}
              style={{ minHeight: 140 }}
              placeholder="1. Hospital inventory system — React + Node + Postgres. Built the full backend and the dashboard UI. Deployed on Railway. Link: ..."
            />
          </Field>
        </div>

        <div className="form-section-label">About this role</div>
        <div className="form-grid">
          <Field
            id="why_welfo"
            label="Why Welfo?"
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            hint="Why do you want to work on this specifically? We are building internal tools for a medical fiber optics company — what draws you to this?"
            full
          >
            <textarea
              value={form.why_welfo}
              onChange={(e) => set("why_welfo", e.target.value)}
              style={{ minHeight: 120 }}
              placeholder="Be direct. We care about genuine interest over polish."
            />
          </Field>

          <Field id="available_from" label="Available from" errors={displayErrors} touched={touched} onBlur={touch} hint="Month and year you can start">
            <input
              type="text"
              value={form.available_from}
              onChange={(e) => set("available_from", e.target.value)}
              placeholder="August 2026"
            />
          </Field>

          <Field id="duration" label="Internship duration" errors={displayErrors} touched={touched} onBlur={touch}>
            <select
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
            >
              <option value="">Select duration</option>
              <option value="2 months">2 months</option>
              <option value="3 months">3 months</option>
              <option value="4 months">4 months</option>
              <option value="6 months">6 months</option>
              <option value="Flexible">Flexible / open to discussion</option>
            </select>
          </Field>

          <Field id="work_preference" label="Work preference" errors={displayErrors} touched={touched} onBlur={touch} hint="We are based in Rishikesh, Uttarakhand">
            <select
              value={form.work_preference}
              onChange={(e) => set("work_preference", e.target.value)}
            >
              <option value="">Select preference</option>
              <option value="On-site (Rishikesh)">On-site — Rishikesh</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </Field>
        </div>

        <div className="form-section-label">Submission</div>
        <div className="form-grid">
          <Field
            id="resume_link"
            label="Resume link"
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            hint="Google Drive, Notion, or any public link. Make sure it is accessible."
            full
          >
            <input
              type="url"
              value={form.resume_link}
              onChange={(e) => set("resume_link", e.target.value)}
              placeholder="https://drive.google.com/file/..."
            />
          </Field>

          <Field
            id="additional_notes"
            label="Anything else you want to share"
            optional
            errors={displayErrors}
            touched={touched}
            onBlur={touch}
            full
          >
            <textarea
              value={form.additional_notes}
              onChange={(e) => set("additional_notes", e.target.value)}
              placeholder="Open to add anything that does not fit above — side projects, context, questions..."
            />
          </Field>
        </div>

        {submitError && (
          <div className="submit-error">{submitError}</div>
        )}

        <div className="form-submit-row">
          <p className="form-submit-note">
            Your data goes directly into our internal database.
            We do not share it with third parties.
          </p>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" />
                Submitting...
              </>
            ) : (
              <>
                Submit application
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
