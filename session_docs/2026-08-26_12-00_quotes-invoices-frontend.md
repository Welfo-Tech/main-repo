# Quotes + Invoices Frontend UI + Seed Data

**Date:** 2026-08-26
**Branch:** `feat/admin-quotes-invoices`
**Backend branch:** `feat/api-v1-quotes-invoices` (committed earlier, `bfda673`)

---

## What was done

Built the complete Quotes and Invoices frontend UI and extended the seed with a full demo workflow. The backend (repository, service, routes, tests) was built in a prior context — this session covered the admin frontend and seed.

---

## Files changed

### New files

**`apps/admin/types/quote.ts`**
- `QuoteStatus`, `QuoteLineItemType`, `GstType`, `ApprovalMethod` type unions
- `QuoteLineItem` and `Quote` interfaces (matches API response shape)
- `STATUS_LABELS`, `STATUS_COLORS`, `ITEM_TYPE_LABELS` display maps
- `formatINR(value)` helper using `Intl.NumberFormat` with `en-IN` / `INR`

**`apps/admin/types/invoice.ts`**
- `InvoiceStatus`, `PaymentMethod`, `PaymentStatus` type unions
- `InvoiceLineItem`, `Payment`, `Invoice` interfaces
- `STATUS_LABELS`, `STATUS_COLORS`, `METHOD_LABELS` display maps
- `formatINR(value)` helper (same pattern as quote)
- `paidPercent(inv: Invoice): number` — calculates paid % clamped to 0–100

**`apps/admin/app/quotes/[id]/page.tsx`**
- Full quote detail page
- Line items table (sortOrder, type, description, qty, unitPrice, discountPct%, GST%, lineTotal)
- Inline "Add Item" form: type, description, qty, unitPrice, discountPct, taxRate, hsnCode, gstType — POST to `/api/v1/quotes/:id/line-items`
- Remove button per item (only shown when quote is editable) — DELETE to `/api/v1/quotes/:id/line-items/:itemId`
- Totals footer: subtotal, GST, total
- `STATUS_ACTIONS` map drives transition buttons:
  - DRAFT → UNDER_REVIEW
  - UNDER_REVIEW → SENT, DRAFT
  - SENT → APPROVED (needs `approvedByName`), REJECTED (needs `rejectionReason`), EXPIRED
- Approval and rejection detail cards shown at bottom when applicable

**`apps/admin/app/invoices/[id]/page.tsx`**
- Full invoice detail page
- Summary cards: Total Amount, Paid (with progress bar), Outstanding (with due date)
- Status actions: DRAFT→ISSUED, ISSUED→CANCELLED, PARTIALLY_PAID→DISPUTED/CANCELLED, OVERDUE→DISPUTED/WRITTEN_OFF, DISPUTED→ISSUED/CANCELLED
- Line items table (read-only on invoice — line items come from quote copy)
- Totals footer: subtotal, GST, total
- Payment history table: date, method, amount, reference, status, notes, Verify button (RECORDED only)
- Inline "Record Payment" form (shows when status allows): amount, method, paymentDate, referenceNumber, notes
  - POST to `/api/v1/invoices/:id/payments`
  - outstanding balance shown as input placeholder
- Verify button: PATCH to `/api/v1/invoices/:id/payments/:paymentId/verify` (ADMIN only)
- Footer: createdBy, createdAt, paymentTerms, cancellationReason if applicable

### Modified files

**`apps/admin/app/quotes/page.tsx`** (was stub)
- Full list: status filter chips, table with quoteNumber, case link, org, version, total (formatINR), status badge, createdAt
- Fetches from `/api/v1/quotes?status=...`
- Note at top: "Create quotes from a Service Case detail page"

**`apps/admin/app/invoices/page.tsx`** (was stub)
- Full list: status filter chips, table with invoiceNumber, case link, org, total, paid progress bar (pct%), status badge, dueDate
- Fetches from `/api/v1/invoices?status=...`

**`packages/db/prisma/seed.ts`**
- Added 6 new seed records (all idempotent upserts with fixed UUIDs):
  - `ServiceCase` — WFC-2026-0001, DIAGNOSIS status, Apollo Hospitals + WF-2024-00001
  - `Quote` — QTE-2026-0001, APPROVED, v1, 2 line items, ₹29,500 total (₹25k + 18% GST)
    - Line item 1: Light guide bundle, PART, ₹18,000, HSN 90189099, IGST
    - Line item 2: Labor 4hr, LABOR, ₹7,000, IGST
  - `Invoice` — INV-2026-0001, PARTIALLY_PAID, ₹29,500 total, ₹14,750 paid
    - Line items copied from quote (same structure)
    - Payment: ₹14,750, BANK_TRANSFER, NEFT2026082200019, VERIFIED status

---

## Key decisions

**Why seed invoice line items separately from quote line items**
Even though the invoice was created from the quote, invoice line items are stored independently (separate table). The seed mirrors them manually. In the API, `openInvoice(quoteId)` copies them automatically from the approved quote.

**Why paidPercent is a helper not stored state**
`paidPercent` is computed from `paidAmount / totalAmount`. We don't store it — the DB has `paidAmount` and `totalAmount` as Decimal columns, so it's always derivable. The `paidPercent` helper lives in `types/invoice.ts` for UI use only.

**Why the Invoice detail page has read-only line items**
Invoice line items are immutable after creation (set from the quote at invoice opening time). The API has no endpoint to add/remove invoice line items post-creation — only payments are appended. So the UI shows them read-only.

**`lineTotal` in seed is manually calculated**
The API recalculates `lineTotal` and quote/invoice totals on every add/remove operation. In the seed file, we bypass the API and write directly to the DB via Prisma, so `lineTotal`, `subtotal`, `taxAmount`, and `totalAmount` must be manually correct. They are.

---

## Pending / not done

- Service case detail page does not yet have "New Quote" and "New Invoice" buttons — those are the natural entry points for creating quotes/invoices from a case. Currently you create via the API directly.
- Invoices list page could show an overdue badge (compare dueDate to today) — not implemented yet.
- Quote PDF export — not planned yet.
- Payment receipt PDF — not planned yet.

---

## PRs to raise

1. `feat/api-v1-quotes-invoices` → `active-dev-backend` (backend was committed earlier as `bfda673`)
2. `feat/admin-quotes-invoices` → `active-dev-frontend` (frontend committed `2d89df9`)

Merge both into `active-dev`, then raise `active-dev` → `staging` → `dev` → `master` per GitHub rules.
