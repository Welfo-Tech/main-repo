import { useState } from "react";
import ApplicationForm from "./components/ApplicationForm.js";
import SuccessState from "./components/SuccessState.js";
import AdminPage from "./pages/AdminPage.js";

function IconBriefcase() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconStipend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function App() {
  const [submitted, setSubmitted] = useState(false);

  if (window.location.pathname.startsWith("/admin")) return <AdminPage />;
  if (submitted) return <SuccessState />;

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span className="nav-logo-dot" />
            Welfo Fiber Optics
          </a>
          <span className="nav-badge">Internship 2026</span>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Now accepting applications
          </div>
          <h1>
            Build the platform that powers <span>medical device repair</span> in India
          </h1>
          <p className="hero-sub">
            We're Welfo Fiber Optics. Medical fiber optics and endoscopy repair, based in Rishikesh.
            We're digitising everything from scratch and need a full stack engineer
            who actually wants to build something.
          </p>
          <a href="#apply" className="btn-primary">
            Apply now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </a>
        </div>
      </section>

      <div className="info-strip">
        <div className="info-strip-inner">
          <div className="info-chip">
            <IconLocation />
            Rishikesh, Uttarakhand (hybrid / remote negotiable)
          </div>
          <div className="info-chip">
            <IconBriefcase />
            Full Stack Internship
          </div>
          <div className="info-chip">
            <IconClock />
            2 – 6 months
          </div>
          <div className="info-chip">
            <IconUsers />
            1 position
          </div>
          <div className="info-chip">
            <IconStipend />
            Stipend provided
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-text">
              <p className="section-label">Who we are</p>
              <h2 className="section-title">Medical fiber optics. Real operations. Built from zero.</h2>
              <p className="section-body">
                Welfo repairs and services fiber optic cables and endoscopes used in hospitals
                and diagnostic centres across India. Every repair case, every spare part, every
                invoice is currently on paper or in spreadsheets.
              </p>
              <p className="section-body" style={{ marginTop: 16 }}>
                We're building the internal platform that runs all of this. Repair case management,
                inventory, quoting, invoicing, dispatch tracking, customer portal. Greenfield
                TypeScript monorepo. You'll be working directly on production code.
              </p>
            </div>
            <div className="about-cards">
              <div className="about-card">
                <div className="about-card-icon">
                  <IconCode />
                </div>
                <h4>Greenfield build</h4>
                <p>No legacy code. Everything is being written from scratch with modern tooling.</p>
              </div>
              <div className="about-card">
                <div className="about-card-icon">
                  <IconDatabase />
                </div>
                <h4>Real data model</h4>
                <p>26 Prisma models, PostgreSQL on Neon, complex domain logic. Actual engineering.</p>
              </div>
              <div className="about-card">
                <div className="about-card-icon">
                  <IconLayers />
                </div>
                <h4>Full ownership</h4>
                <p>You'll ship features end to end. Schema to API to UI. Not just tickets.</p>
              </div>
              <div className="about-card">
                <div className="about-card-icon">
                  <IconShield />
                </div>
                <h4>Medical domain</h4>
                <p>Fiber optics, endoscopy repair, GST compliance, multi-role access control.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <p className="section-label">The role</p>
          <h2 className="section-title">What you will work on</h2>
          <p className="section-body">
            You'll join as the sole intern on the engineering team and work directly
            with the technical lead on the operational platform.
          </p>

          <div className="role-grid">
            <div className="role-col">
              <h3>What you'll build</h3>
              <ul className="role-list">
                <li>REST API endpoints using Hono on Node.js. Service cases, quotes, invoices, inventory.</li>
                <li>Admin dashboard UI in React. Repair case management, technician assignment, financial views.</li>
                <li>Customer portal where organisations view their device history and approve quotes.</li>
                <li>Database migrations and schema evolution in Prisma and PostgreSQL.</li>
                <li>Auth flows. JWT access and refresh tokens, role-based middleware.</li>
                <li>Monitoring dashboards, structured logging, Prometheus metrics.</li>
              </ul>
            </div>
            <div className="role-col">
              <h3>What we need from you</h3>
              <ul className="role-list">
                <li>Solid React. You can build a complex multi-view dashboard without hand-holding.</li>
                <li>Comfortable with Node.js and building REST APIs. Route design, validation, error handling.</li>
                <li>You've used PostgreSQL before and understand relational data modelling.</li>
                <li>TypeScript. Not just tolerating it, actually writing typed code.</li>
                <li>You write code that other people can read and maintain.</li>
                <li>You're available for regular calls and can work independently between them.</li>
              </ul>

              <p style={{ marginTop: 28, marginBottom: 12, fontSize: 13, fontWeight: 700, color: "var(--grey-700)" }}>
                Our stack
              </p>
              <div className="stack-tags">
                {["TypeScript", "React", "Hono", "Node.js", "PostgreSQL", "Prisma", "Neon", "Turborepo", "Vite", "Vitest", "Docker", "pino", "Zod", "JWT"].map((t) => (
                  <span key={t} className="stack-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="section">
        <div className="section-inner">
          <p className="section-label">Apply</p>
          <h2 className="section-title">Ready? Fill in the form below.</h2>
          <p className="section-body">
            No cover letter needed. Just answer the questions honestly.
            We go through every application ourselves.
          </p>
          <ApplicationForm onSuccess={() => setSubmitted(true)} />
        </div>
      </section>

      <footer className="footer">
        <p>
          <span>Welfo Fiber Optics</span> · Rishikesh, Uttarakhand, India
        </p>
        <p style={{ marginTop: 4 }}>
          Medical fiber optics and endoscopy repair. Building the operations platform from scratch.
        </p>
      </footer>
    </>
  );
}
