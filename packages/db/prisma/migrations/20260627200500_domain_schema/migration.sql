/*
  Warnings:

  - You are about to drop the `setup_test` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATIONS', 'FINANCE', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('HOSPITAL', 'CLINIC', 'DISTRIBUTOR', 'DEALER', 'SERVICE_PARTNER');

-- CreateEnum
CREATE TYPE "OrganizationTier" AS ENUM ('STANDARD', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ENDOSCOPE', 'FIBER_OPTIC', 'IMAGING_DEVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('UNREGISTERED', 'REGISTERED', 'IN_SERVICE', 'UNDER_REPAIR', 'RETIRED', 'LOST', 'SCRAPPED');

-- CreateEnum
CREATE TYPE "ServiceCaseType" AS ENUM ('REPAIR', 'SPARE_DEPLOYMENT', 'INSPECTION', 'WARRANTY_CLAIM');

-- CreateEnum
CREATE TYPE "ServiceCaseStatus" AS ENUM ('DRAFT', 'INTAKE', 'ASSIGNED', 'UNDER_ASSESSMENT', 'AWAITING_QUOTE_APPROVAL', 'WORK_AUTHORIZED', 'IN_REPAIR', 'QC_PENDING', 'QC_PASSED', 'QC_FAILED', 'DISPATCH_READY', 'DISPATCHED', 'DELIVERED', 'CLOSED', 'ON_HOLD', 'IRREPAIRABLE', 'QUOTE_REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'INTAKE_RECEIVED', 'CONVERTED', 'REJECTED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "TicketUrgency" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ApprovalMethod" AS ENUM ('EMAIL', 'PHONE', 'PORTAL', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "QuoteLineItemType" AS ENUM ('PART', 'LABOR', 'SHIPPING', 'OTHER');

-- CreateEnum
CREATE TYPE "GstType" AS ENUM ('CGST_SGST', 'IGST', 'EXEMPT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('RECORDED', 'VERIFIED', 'RECONCILED', 'DISPUTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI', 'CARD');

-- CreateEnum
CREATE TYPE "DispatchDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- CreateEnum
CREATE TYPE "RepairEventType" AS ENUM ('OBSERVATION', 'PART_REPLACED', 'TEST_PERFORMED', 'FAULT_IDENTIFIED', 'NOTE', 'CORRECTION');

-- CreateEnum
CREATE TYPE "CaseActivityType" AS ENUM ('STATUS_CHANGE', 'NOTE', 'CUSTOMER_COMMUNICATION', 'ASSIGNMENT_CHANGE', 'DOCUMENT_ADDED');

-- CreateEnum
CREATE TYPE "CaseActivityVisibility" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('ADMIN', 'TECHNICIAN', 'OPERATIONS', 'FINANCE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('INTAKE_PHOTO', 'QC_PHOTO', 'REPAIR_PHOTO', 'SIGNED_QUOTE', 'DELIVERY_RECEIPT', 'INVOICE_DOCUMENT', 'CUSTOMER_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "SlaEventType" AS ENUM ('BREACH_WARNING', 'BREACHED', 'ESCALATED', 'RESOLVED');

-- DropTable
DROP TABLE "setup_test";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "tier" "OrganizationTier" NOT NULL DEFAULT 'STANDARD',
    "gstNumber" VARCHAR(50),
    "panNumber" VARCHAR(50),
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "website" VARCHAR(255),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_contacts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "designation" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "customer_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_models" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "manufacturer" VARCHAR(255) NOT NULL DEFAULT 'Welfo',
    "description" TEXT,
    "specifications" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "serialNumber" VARCHAR(255) NOT NULL,
    "modelId" UUID,
    "ownerOrgId" UUID,
    "manufactureDate" DATE,
    "saleDate" DATE,
    "warrantyExpiry" DATE,
    "status" "ProductStatus" NOT NULL DEFAULT 'REGISTERED',
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_model_spare_parts" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "partId" UUID NOT NULL,

    CONSTRAINT "product_model_spare_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "employeeId" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(50),
    "specializations" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_cases" (
    "id" UUID NOT NULL,
    "caseNumber" VARCHAR(20) NOT NULL,
    "type" "ServiceCaseType" NOT NULL DEFAULT 'REPAIR',
    "status" "ServiceCaseStatus" NOT NULL DEFAULT 'INTAKE',
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" UUID NOT NULL,
    "contactId" UUID,
    "productId" UUID NOT NULL,
    "assignedTechnicianId" UUID,
    "ticketId" UUID,
    "priority" "CasePriority" NOT NULL DEFAULT 'NORMAL',
    "slaDeadline" TIMESTAMPTZ,
    "intakeCondition" TEXT,
    "closedAt" TIMESTAMPTZ,
    "cancellationReason" TEXT,
    "holdReason" TEXT,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "service_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "ticketNumber" VARCHAR(20) NOT NULL,
    "organizationId" UUID NOT NULL,
    "contactId" UUID,
    "productId" UUID,
    "reportedProblem" TEXT NOT NULL,
    "urgency" "TicketUrgency" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_assignments" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "technicianId" UUID NOT NULL,
    "assignedBy" UUID NOT NULL,
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMPTZ,
    "reason" TEXT,

    CONSTRAINT "technician_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL,
    "quoteNumber" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "caseId" UUID NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "validUntil" DATE,
    "terms" TEXT,
    "approvedByName" VARCHAR(255),
    "approvedAt" TIMESTAMPTZ,
    "approvalMethod" "ApprovalMethod",
    "rejectionReason" TEXT,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_line_items" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "itemType" "QuoteLineItemType" NOT NULL,
    "partId" UUID,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "hsnCode" VARCHAR(20),
    "gstType" "GstType" NOT NULL DEFAULT 'CGST_SGST',

    CONSTRAINT "quote_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoiceNumber" VARCHAR(20) NOT NULL,
    "caseId" UUID NOT NULL,
    "quoteId" UUID,
    "organizationId" UUID NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" DATE,
    "dueDate" DATE,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "paymentTerms" TEXT,
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMPTZ,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "itemType" "QuoteLineItemType" NOT NULL,
    "partId" UUID,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "hsnCode" VARCHAR(20),
    "gstType" "GstType" NOT NULL DEFAULT 'CGST_SGST',

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" DATE NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "referenceNumber" VARCHAR(255),
    "notes" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'RECORDED',
    "recordedBy" UUID NOT NULL,
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spare_parts" (
    "id" UUID NOT NULL,
    "partNumber" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "unitPrice" DECIMAL(12,2),
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "reorderThreshold" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "spare_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_events" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "technicianId" UUID NOT NULL,
    "eventType" "RepairEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "eventAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_event_parts" (
    "id" UUID NOT NULL,
    "repairEventId" UUID NOT NULL,
    "partId" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "repair_event_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_records" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "direction" "DispatchDirection" NOT NULL,
    "courierName" VARCHAR(255),
    "trackingNumber" VARCHAR(255),
    "dispatchDate" DATE,
    "expectedDelivery" DATE,
    "actualDelivery" DATE,
    "fromAddress" JSONB,
    "toAddress" JSONB,
    "conditionNotes" TEXT,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "dispatch_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_activities" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "actorId" UUID,
    "actorType" "ActorType",
    "activityType" "CaseActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "CaseActivityVisibility" NOT NULL DEFAULT 'INTERNAL',
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" UUID,
    "actorType" "ActorType",
    "ipAddress" VARCHAR(45),
    "beforeState" JSONB,
    "afterState" JSONB,
    "changedFields" TEXT[],
    "occurredAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" UUID NOT NULL,
    "category" "AttachmentCategory" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSizeBytes" INTEGER,
    "uploadedBy" UUID NOT NULL,
    "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_events" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "eventType" "SlaEventType" NOT NULL,
    "triggeredAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedActors" TEXT[],

    CONSTRAINT "sla_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

-- CreateIndex
CREATE INDEX "organizations_isActive_idx" ON "organizations"("isActive");

-- CreateIndex
CREATE INDEX "customer_contacts_organizationId_idx" ON "customer_contacts"("organizationId");

-- CreateIndex
CREATE INDEX "customer_contacts_email_idx" ON "customer_contacts"("email");

-- CreateIndex
CREATE INDEX "product_models_category_idx" ON "product_models"("category");

-- CreateIndex
CREATE INDEX "product_models_name_idx" ON "product_models"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_serialNumber_key" ON "products"("serialNumber");

-- CreateIndex
CREATE INDEX "products_serialNumber_idx" ON "products"("serialNumber");

-- CreateIndex
CREATE INDEX "products_ownerOrgId_idx" ON "products"("ownerOrgId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_modelId_idx" ON "products"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "product_model_spare_parts_modelId_partId_key" ON "product_model_spare_parts"("modelId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_userId_key" ON "technicians"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_employeeId_key" ON "technicians"("employeeId");

-- CreateIndex
CREATE INDEX "technicians_employeeId_idx" ON "technicians"("employeeId");

-- CreateIndex
CREATE INDEX "technicians_isActive_idx" ON "technicians"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "service_cases_caseNumber_key" ON "service_cases"("caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "service_cases_ticketId_key" ON "service_cases"("ticketId");

-- CreateIndex
CREATE INDEX "service_cases_caseNumber_idx" ON "service_cases"("caseNumber");

-- CreateIndex
CREATE INDEX "service_cases_organizationId_idx" ON "service_cases"("organizationId");

-- CreateIndex
CREATE INDEX "service_cases_productId_idx" ON "service_cases"("productId");

-- CreateIndex
CREATE INDEX "service_cases_assignedTechnicianId_idx" ON "service_cases"("assignedTechnicianId");

-- CreateIndex
CREATE INDEX "service_cases_status_idx" ON "service_cases"("status");

-- CreateIndex
CREATE INDEX "service_cases_createdAt_idx" ON "service_cases"("createdAt");

-- CreateIndex
CREATE INDEX "service_cases_slaDeadline_idx" ON "service_cases"("slaDeadline");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketNumber_key" ON "tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "tickets_ticketNumber_idx" ON "tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "tickets_organizationId_idx" ON "tickets"("organizationId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");

-- CreateIndex
CREATE INDEX "technician_assignments_caseId_idx" ON "technician_assignments"("caseId");

-- CreateIndex
CREATE INDEX "technician_assignments_technicianId_idx" ON "technician_assignments"("technicianId");

-- CreateIndex
CREATE INDEX "quotes_caseId_idx" ON "quotes"("caseId");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_quoteNumber_idx" ON "quotes"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_caseId_version_key" ON "quotes"("caseId", "version");

-- CreateIndex
CREATE INDEX "quote_line_items_quoteId_idx" ON "quote_line_items"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_caseId_key" ON "invoices"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_quoteId_key" ON "invoices"("quoteId");

-- CreateIndex
CREATE INDEX "invoices_invoiceNumber_idx" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoiceId_idx" ON "invoice_line_items"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "spare_parts_partNumber_key" ON "spare_parts"("partNumber");

-- CreateIndex
CREATE INDEX "spare_parts_partNumber_idx" ON "spare_parts"("partNumber");

-- CreateIndex
CREATE INDEX "spare_parts_name_idx" ON "spare_parts"("name");

-- CreateIndex
CREATE INDEX "spare_parts_isActive_idx" ON "spare_parts"("isActive");

-- CreateIndex
CREATE INDEX "repair_events_caseId_idx" ON "repair_events"("caseId");

-- CreateIndex
CREATE INDEX "repair_events_technicianId_idx" ON "repair_events"("technicianId");

-- CreateIndex
CREATE INDEX "repair_events_eventAt_idx" ON "repair_events"("eventAt");

-- CreateIndex
CREATE INDEX "repair_event_parts_repairEventId_idx" ON "repair_event_parts"("repairEventId");

-- CreateIndex
CREATE INDEX "repair_event_parts_partId_idx" ON "repair_event_parts"("partId");

-- CreateIndex
CREATE INDEX "dispatch_records_caseId_idx" ON "dispatch_records"("caseId");

-- CreateIndex
CREATE INDEX "dispatch_records_status_idx" ON "dispatch_records"("status");

-- CreateIndex
CREATE INDEX "dispatch_records_trackingNumber_idx" ON "dispatch_records"("trackingNumber");

-- CreateIndex
CREATE INDEX "case_activities_caseId_idx" ON "case_activities"("caseId");

-- CreateIndex
CREATE INDEX "case_activities_createdAt_idx" ON "case_activities"("createdAt");

-- CreateIndex
CREATE INDEX "case_activities_visibility_idx" ON "case_activities"("visibility");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_occurredAt_idx" ON "audit_logs"("occurredAt");

-- CreateIndex
CREATE INDEX "attachments_entityType_entityId_idx" ON "attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "attachments_entityType_entityId_category_idx" ON "attachments"("entityType", "entityId", "category");

-- CreateIndex
CREATE INDEX "sla_events_caseId_idx" ON "sla_events"("caseId");

-- CreateIndex
CREATE INDEX "sla_events_triggeredAt_idx" ON "sla_events"("triggeredAt");

-- AddForeignKey
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "product_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_ownerOrgId_fkey" FOREIGN KEY ("ownerOrgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_model_spare_parts" ADD CONSTRAINT "product_model_spare_parts_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "product_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_model_spare_parts" ADD CONSTRAINT "product_model_spare_parts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "spare_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "customer_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_assignedTechnicianId_fkey" FOREIGN KEY ("assignedTechnicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cases" ADD CONSTRAINT "service_cases_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "customer_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_assignments" ADD CONSTRAINT "technician_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_assignments" ADD CONSTRAINT "technician_assignments_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_assignments" ADD CONSTRAINT "technician_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_partId_fkey" FOREIGN KEY ("partId") REFERENCES "spare_parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_partId_fkey" FOREIGN KEY ("partId") REFERENCES "spare_parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_events" ADD CONSTRAINT "repair_events_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_events" ADD CONSTRAINT "repair_events_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_event_parts" ADD CONSTRAINT "repair_event_parts_repairEventId_fkey" FOREIGN KEY ("repairEventId") REFERENCES "repair_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_event_parts" ADD CONSTRAINT "repair_event_parts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "spare_parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_records" ADD CONSTRAINT "dispatch_records_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_activities" ADD CONSTRAINT "case_activities_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_events" ADD CONSTRAINT "sla_events_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "service_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Welfo custom: number generation sequences
CREATE SEQUENCE IF NOT EXISTS welfo_case_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS welfo_ticket_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS welfo_quote_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS welfo_invoice_seq START WITH 1 INCREMENT BY 1;

-- Welfo custom: human-readable number generation functions
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS VARCHAR AS $$
  SELECT 'WFC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('welfo_case_seq')::text, 4, '0');
$$ LANGUAGE sql VOLATILE;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR AS $$
  SELECT 'TKT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('welfo_ticket_seq')::text, 4, '0');
$$ LANGUAGE sql VOLATILE;

CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS VARCHAR AS $$
  SELECT 'QTE-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('welfo_quote_seq')::text, 4, '0');
$$ LANGUAGE sql VOLATILE;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR AS $$
  SELECT 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('welfo_invoice_seq')::text, 4, '0');
$$ LANGUAGE sql VOLATILE;

-- Welfo custom: service case status transition guard
CREATE OR REPLACE FUNCTION validate_case_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'CLOSED' AND NEW.status != 'CLOSED' THEN
    RAISE EXCEPTION 'service_case % is CLOSED and cannot transition to %. Admin override required.', OLD.id, NEW.status;
  END IF;
  IF NEW.status = 'CANCELLED' AND (NEW."cancellationReason" IS NULL OR trim(NEW."cancellationReason") = '') THEN
    RAISE EXCEPTION 'service_case % cannot be set to CANCELLED without a cancellationReason.', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_case_status_transition
  BEFORE UPDATE OF status ON service_cases
  FOR EACH ROW
  EXECUTE FUNCTION validate_case_status_transition();
