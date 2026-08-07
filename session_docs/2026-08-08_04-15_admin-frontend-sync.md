# 2026-08-08 Admin Frontend Sync

## What was done

Wired the admin frontend to real API endpoints for every domain the backend has implemented.
Before this, every domain page was a `<h1>` stub with no data.

Branch: `feat/admin-frontend-sync` (branched from `origin/active-dev-frontend`)
Commit: `7122362 feat: wire admin frontend to API — orgs, contacts, products, product-models`

---

## Files created

- `apps/admin/lib/api.ts` — centralized API client. Reads `NEXT_PUBLIC_API_URL` and `accessToken` from localStorage. Adds Authorization header automatically. Redirects to /login on 401. Typed `api.get / post / patch / del` methods.
- `apps/admin/types/contact.ts` — CustomerContact interface
- `apps/admin/types/product-model.ts` — ProductModel interface + CATEGORY_LABELS map
- `apps/admin/types/product.ts` — Product interface + STATUS_LABELS + STATUS_COLORS maps

---

## Files replaced or added

### `apps/admin/app/organizations/page.tsx` (replaced stub)
- Fetches from `GET /api/v1/organizations` with search and type filters
- Table: Name, Type, Tier, GST#, Payment Terms, Status
- "+ Add Organization" button reveals inline create form
- Create form sends to `POST /api/v1/organizations`
- Row "View" button navigates to `/organizations/[id]`

### `apps/admin/app/organizations/[id]/page.tsx` (new)
- Fetches org detail and contacts in parallel
- Shows org info card (type, tier, GST, PAN, payment terms, website, notes)
- Contacts table below (name, designation, email, phone, primary badge, active status)
- "+ Add Contact" button reveals inline form
- Create contact sends to `POST /api/v1/organizations/:id/contacts`

### `apps/admin/app/products/page.tsx` (replaced stub)
- Fetches from `GET /api/v1/products` with status filter chips and serial number search
- Table: Serial Number (monospace), Model + Category, Owner Org, Status badge, Warranty Expiry
- "Register Product" button loads product-models and orgs dropdowns, then reveals create form
- Create sends to `POST /api/v1/products`

### `apps/admin/app/product-models/page.tsx` (new)
- Fetches from `GET /api/v1/product-models` with category filter chips
- Table: Name, Category badge, Manufacturer, Description, Active status
- "+ Add Model" button reveals inline create form
- Create sends to `POST /api/v1/product-models`

---

## Files modified

### `apps/admin/components/layout/Sidebar.tsx`
- Fixed `bg-` (broken incomplete class) → `bg-white`
- Fixed active item: `bg-indigo-600` → `bg-[#0F4C81]`
- Added `overflow-y-auto` to handle long sidebar on small screens
- Added active highlight for sub-paths (`pathname.startsWith`)
- Added "Product Models" nav item at `/product-models`

### `apps/admin/app/login/page.tsx`
- Removed `console.error(error)` from catch block
- Gradient: `#2d1b75→#3b2295→#4a29c4` → `#0a3560→#0F4C81→#1a6aab`
- Buttons: `#25155e hover:#1f114d` → `#0F4C81 hover:#0a3560`
- Floating sidebar button: `#24145d hover:#1c0f49` → same navy

### `apps/admin/components/layout/Header.tsx`
- All `text-purple-700` → `text-[#0F4C81]`
- All `hover:text-violet-900` → `hover:text-[#0a3560]`

---

## Key decisions

**All pages are `"use client"` components.**
Auth token is in localStorage which is browser-only. There is no server-side session. Every data page must run on the client.

**Inline create forms, not modals.**
Keeps everything in the page flow. Easier to implement and less disruptive than overlay modals for an internal tool.

**Products form loads orgs and models on open.**
Only fetches the dropdown data when the user opens the create form. Uses `isActive=true` filter on both to keep dropdowns clean.

**Sidebar active state uses `startsWith`.**
`/organizations/some-id` should keep "Organizations" highlighted. Simple prefix match handles all nested routes correctly.

**Brand color fix.**
Tanu's fix commit (`3287417`) was not included in the merge into `active-dev-frontend` (the merge was done against an earlier commit). The color fixes have been re-applied in this branch.

---

## What is NOT synced yet (backend not built)

- Service Cases
- Tickets
- Quotes
- Invoices + Payments

These remain as `<h1>` stubs. Build the backend first, then sync.

---

## PR target

`feat/admin-frontend-sync` → `active-dev-frontend`
