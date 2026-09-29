-- Store storage object paths for photos attached to a web inquiry.
-- Paths, not full URLs, so the storage host can change without a data migration.

ALTER TABLE "web_inquiries"
  ADD COLUMN "photoPaths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
