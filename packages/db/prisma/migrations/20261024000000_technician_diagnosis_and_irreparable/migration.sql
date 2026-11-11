-- Technician diagnosis photos and the irreparable proposal flow.
--
-- Diagnosis photos are distinct from repair photos: they are the evidence
-- behind an irreparable verdict, not a record of work in progress. Keeping
-- them separate keeps a product's history readable years later.
--
-- SECOND_CHANCE is the state where a technician has called an instrument
-- irreparable and an admin has overridden that to try anyway. Both facts stay
-- on the record until a final verdict, so the override is never invisible.

ALTER TYPE "AttachmentCategory" ADD VALUE IF NOT EXISTS 'DIAGNOSIS_PHOTO';

CREATE TYPE "IrreparableState" AS ENUM ('PROPOSED', 'CONFIRMED', 'SECOND_CHANCE', 'WITHDRAWN');

ALTER TABLE "service_cases"
  ADD COLUMN "irreparableState"       "IrreparableState",
  ADD COLUMN "irreparableReason"      TEXT,
  ADD COLUMN "irreparableProposedBy"  UUID,
  ADD COLUMN "irreparableProposedAt"  TIMESTAMPTZ,
  ADD COLUMN "irreparableVerdictBy"   UUID,
  ADD COLUMN "irreparableVerdictAt"   TIMESTAMPTZ,
  ADD COLUMN "irreparableVerdictNote" TEXT;

CREATE INDEX "service_cases_irreparableState_idx" ON "service_cases"("irreparableState");
