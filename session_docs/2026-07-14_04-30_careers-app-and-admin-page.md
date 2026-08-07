# 2026-07-14 Careers App and Admin Page

## What was done

Built `apps/careers` from scratch: a standalone React + Vite + Supabase internship application site for Welfo Fiber Optics.

## Files created or changed

### New app: `apps/careers/`

- `package.json` — React 19, Vite 6, @supabase/supabase-js
- `tsconfig.json` — ESNext modules, bundler resolution, vite/client types, react-jsx
- `vite.config.ts` — react plugin, historyApiFallback for /admin SPA route, port 5174
- `index.html` — Inter font from Google Fonts
- `src/lib/supabase.ts` — Supabase client, ApplicationPayload/Application types, submitApplication, getApplications, updateApplicationStatus helpers
- `src/components/ApplicationForm.tsx` — ~20 field internship form; sections: personal, education, tech skills, motivation, logistics; Zod-style manual validation with blur-triggered errors; submits to Supabase anon INSERT
- `src/pages/AdminPage.tsx` — Supabase auth login, applications table with filter tabs, full-page detail view (see below)
- `src/App.tsx` — root: routes to AdminPage if pathname starts with /admin, else shows landing + form
- `src/styles/globals.css` — full design system: CSS variables (navy/teal), nav, hero, form, admin styles

### Start script

- `scripts/start-stop/start-careers.sh` — checks for .env, starts vite on port 5174

### Schema doc

- `tech_docs/supabase_careers_schema.sql` — internship_applications table with RLS policies (anon INSERT, authenticated SELECT/UPDATE)

## Key decisions

### No backend
All data flows browser -> Supabase directly. Supabase RLS enforces access: anon can insert applications, authenticated users (admin) can read and update.

### Simple routing
Used window.location.pathname instead of react-router. Vite historyApiFallback serves index.html for /admin. Keeps the bundle small and avoids a router dependency.

### Admin full-page detail view
When an application row is clicked, the page replaces the table with a full-page ApplicationDetail component. The nav stays sticky at top. A back chevron button appears in the nav right side ("Applications") to return to the list. Status change buttons on the detail page update Supabase and reflect immediately in the list state via onStatusChange callback.

This replaced an earlier side-panel/drawer design that the user rejected.

### Admin auth
Uses Supabase Auth (project-level email/password users). The admin creates a user in Supabase Authentication > Users dashboard. The /admin page calls supabase.auth.signInWithPassword. RLS then allows authenticated queries.

## Line numbers for key sections (AdminPage.tsx)

- AdminNav (with optional back button): lines 42-70
- ApplicationDetail (full-page view): lines 78-211
- LoginForm: lines 213-266
- AdminPage (main): lines 268-401

## Status changes flow

pending -> reviewing -> selected -> rejected (any direction allowed via status buttons)

## What is left open

Nothing from this session. Careers site is shipped and tested end to end (test entry confirmed visible in Supabase and in /admin).
