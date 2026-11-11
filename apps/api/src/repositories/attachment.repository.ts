import { type AttachmentCategory, prisma } from "@repo/db";

const CASE_ENTITY = "ServiceCase";

const attachmentSelect = {
  id: true,
  entityType: true,
  entityId: true,
  category: true,
  fileUrl: true,
  fileName: true,
  mimeType: true,
  fileSizeBytes: true,
  uploadedAt: true,
  uploader: { select: { id: true, name: true, role: true } },
} as const;

export interface NewAttachment {
  caseId: string;
  category: AttachmentCategory;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes?: number;
  uploadedBy: string;
}

export async function createCaseAttachments(items: NewAttachment[]) {
  if (items.length === 0) return [];

  await prisma.attachment.createMany({
    data: items.map(i => ({
      entityType: CASE_ENTITY,
      entityId: i.caseId,
      category: i.category,
      fileUrl: i.fileUrl,
      fileName: i.fileName,
      mimeType: i.mimeType,
      fileSizeBytes: i.fileSizeBytes,
      uploadedBy: i.uploadedBy,
    })),
  });

  return prisma.attachment.findMany({
    where: {
      entityType: CASE_ENTITY,
      entityId: items[0]!.caseId,
      fileUrl: { in: items.map(i => i.fileUrl) },
    },
    select: attachmentSelect,
  });
}

export async function findCaseAttachments(
  caseId: string,
  category?: AttachmentCategory,
) {
  return prisma.attachment.findMany({
    where: {
      entityType: CASE_ENTITY,
      entityId: caseId,
      ...(category ? { category } : {}),
    },
    select: attachmentSelect,
    orderBy: { uploadedAt: "desc" },
  });
}

/** Customer photos live on the inquiry that produced this case, not on the case. */
export async function findInquiryPhotosForCase(caseId: string) {
  const inquiry = await prisma.webInquiry.findUnique({
    where: { convertedCaseId: caseId },
    select: { inquiryNumber: true, photoPaths: true, submittedAt: true },
  });
  return inquiry ?? null;
}
