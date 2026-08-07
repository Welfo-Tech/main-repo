-- Add outstanding_amount as a generated column on invoices.
-- This is always (totalAmount - paidAmount) and is enforced at the DB level
-- so application bugs cannot produce an inconsistent outstanding balance.
ALTER TABLE "invoices"
  ADD COLUMN "outstandingAmount" DECIMAL(12,2)
  GENERATED ALWAYS AS ("totalAmount" - "paidAmount") STORED;
