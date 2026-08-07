2026-07-13 | careers app — internship application form

## What was done

Built a standalone internship application page for Welfo Fiber Optics as a new app in the monorepo at `apps/careers`. React + Vite, TypeScript, Supabase JS client for direct browser-to-DB form submissions. No backend required.

## Files created

**App scaffolding**
- `apps/careers/package.json` — React 19, Vite 6, @supabase/supabase-js, TypeScript
- `apps/careers/tsconfig.json` — bundler module resolution, vite/client types for import.meta.env
- `apps/careers/vite.config.ts` — @vitejs/plugin-react
- `apps/careers/index.html` — Inter font from Google Fonts, meta description
- `apps/careers/.env.example` — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

**Source**
- `apps/careers/src/main.tsx` — entry point
- `apps/careers/src/App.tsx` — full page: Nav, Hero, info strip, About section, Role section, Form section, Footer
- `apps/careers/src/components/ApplicationForm.tsx` — full form with inline validation, Field wrapper using React.cloneElement, submit state, spinner, error display
- `apps/careers/src/components/SuccessState.tsx` — post-submission screen
- `apps/careers/src/lib/supabase.ts` — createClient, ApplicationPayload type, submitApplication()
- `apps/careers/src/styles/globals.css` — full design system in CSS variables, responsive, no external CSS library

**DB schema**
- `tech_docs/supabase_careers_schema.sql` — CREATE TABLE internship_applications + RLS: anon INSERT allowed, no SELECT policy (write-only from browser)

## Design

- Primary: navy `#0F4C81`, accent: teal `#00B4D8`, font: Inter
- Sections: Hero (gradient navy), info strip (navy), About (white, 2-col), Role (off-white, 2-col), Form (white), Footer (grey-900)
- Fully responsive — collapses to single column below 768px

## Form fields

Personal: full_name, email, phone, linkedin_url, github_url, portfolio_url
Academic: college, degree, field_of_study, graduation_year
Technical: frontend_skills, backend_skills, db_experience, notable_projects
Role: why_welfo, available_from, duration (dropdown), work_preference (dropdown)
Submission: resume_link, additional_notes (optional)

## Key decisions

**Supabase direct from browser**: anon key with RLS policy `public_insert` allows inserts only. No SELECT policy means applicants cannot read each other's submissions. Review via Supabase dashboard.

**React.cloneElement with Record<string, unknown>**: Field wrapper clones child inputs to inject id, className, onBlur. Typed as `ReactElement<Record<string, unknown>>` to satisfy TypeScript without losing the generic input flexibility.

**Validation on blur + on submit**: fields show errors only after touched (blur) or after a failed submit attempt. `showAllErrors` flag triggers all at once on submit.

## To set up (one-time)

1. Create a Supabase project
2. Run `tech_docs/supabase_careers_schema.sql` in the Supabase SQL editor
3. Copy `apps/careers/.env.example` to `apps/careers/.env`
4. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings
5. `npm run dev` from repo root or `cd apps/careers && npm run dev`

## What is NOT done

- Email notification on submission (Supabase webhook or Edge Function, deferred)
- Anti-spam / rate limiting (fine for now given low volume)
- Custom domain deployment config
