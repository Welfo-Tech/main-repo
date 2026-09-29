-- Add WebInquiry table for public ticket submissions from the website.
-- These are pre-ticket records with no FK dependencies — no org or user required.
-- Ops staff acknowledge and convert them to formal Tickets manually.

CREATE TYPE "WebInquiryStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'CONVERTED', 'CLOSED');

CREATE SEQUENCE IF NOT EXISTS welfo_inquiry_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TEXT LANGUAGE SQL AS $$
  SELECT 'WFI-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('welfo_inquiry_seq')::text, 4, '0');
$$;

CREATE TABLE "web_inquiries" (
  "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
  "inquiryNumber"    VARCHAR(20)   NOT NULL,
  "submitterName"    VARCHAR(255)  NOT NULL,
  "submitterEmail"   VARCHAR(255)  NOT NULL,
  "submitterPhone"   VARCHAR(50),
  "organizationName" VARCHAR(255)  NOT NULL,
  "city"             VARCHAR(100),
  "productModel"     VARCHAR(255)  NOT NULL,
  "serialNumber"     VARCHAR(100),
  "purchaseDate"     DATE,
  "reportedProblem"  TEXT          NOT NULL,
  "urgency"          "TicketUrgency" NOT NULL DEFAULT 'NORMAL',
  "status"           "WebInquiryStatus" NOT NULL DEFAULT 'PENDING',
  "submittedAt"      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT "web_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "web_inquiries_inquiryNumber_key" ON "web_inquiries"("inquiryNumber");
CREATE INDEX "web_inquiries_status_idx" ON "web_inquiries"("status");
CREATE INDEX "web_inquiries_submittedAt_idx" ON "web_inquiries"("submittedAt");
